import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';


@Injectable({
  providedIn: 'root'
})
export class WebSocketNotificationService {
  private stompClient!: Client;
  private notificationSubject = new BehaviorSubject<any>(null);
  private staleOffersSubject = new BehaviorSubject<number[]>([]);

  constructor() {
    this.initializeWebSocketConnection();
  }

  public initializeWebSocketConnection(): void {

 // const serverUrl = 'https://beeconstruct-offre.dpc.com.tn/ws';
   const serverUrl = 'http://localhost:8095/ws';
  

  //const serverUrl = 'https://beeconstruct-chantier.dpc.com.tn/ws';

  this.stompClient = new Client({
    webSocketFactory: () => new SockJS(serverUrl),
    reconnectDelay: 5000,
    debug: (str) => console.log(str)
  });

  this.stompClient.onConnect = (frame) => {
    console.log('Connected: ' + frame);
    this.stompClient.subscribe('/topic/notifications', (message: Message) => {
      try {
        let notification;
        
        // Check if message is JSON or plain string
        if (this.isJsonString(message.body)) {
          // Handle JSON format
          notification = JSON.parse(message.body);
        } else {
          // Handle plain string format
          console.log('Received plain string notification:', message.body);
          
          // Extract offre title from the string message
          const titleMatch = message.body.match(/Offre '(.+?)' hasn't been updated/);
          const titre = titleMatch ? titleMatch[1] : null;
          
          notification = {
            message: message.body,
            titre: titre
          };
        }

        console.log('Processed notification:', notification);
        
        if (notification.titre) {
            this.addToStaleOffers(notification.titre);
            console.log('Added offre to stale list:', notification.titre);
          }
        // Add to notifications
        this.notificationSubject.next(notification);
        
        // Show toast notification
        this.showWarning(
          notification.titre ? `Offre "${notification.titre}" inactive` : 'Offre inactive',
          "Cette offre n'a pas été mise à jour depuis plus d'un mois'"
        );
        
      } catch (error) {
        console.error('Error processing notification:', error, 'Message body:', message.body);
      }
    });
  };

  this.stompClient.activate();
}

 private addToStaleOffers(offreId: number): void {
    const currentStaleOffers = this.staleOffersSubject.value;
    if (!currentStaleOffers.includes(offreId)) {
      const updatedOffers = [...currentStaleOffers, offreId];
      this.staleOffersSubject.next(updatedOffers);
      console.log('Updated stale offers list:', updatedOffers);
    }
  }

private isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

  getNotifications(): Observable<any> {
    return this.notificationSubject.asObservable();
  }

  getStaleOffers(): Observable<number[]> {
    console.log(this.staleOffersSubject)
    return this.staleOffersSubject.asObservable();
    
  }

  getStaleOffersCount(): Observable<number> {
    return new Observable<number>(observer => {
      this.staleOffersSubject.subscribe(offers => {
        observer.next(offers.length);
      });
    });
  }

  clearStaleOffer(offreId: number): void {
    const currentOffers = this.staleOffersSubject.value;
    this.staleOffersSubject.next(currentOffers.filter(id => id !== offreId));
  }

  clearAllStaleOffers(): void {
    this.staleOffersSubject.next([]);
  }

  sendStaleNotification(offreId: number): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/notify-stale',
        body: JSON.stringify({ offreId })
      });
    } else {
      console.warn('Cannot send notification: STOMP client not connected');
    }
  }

  showWarning(title: string, message: string): void {
    this.notificationSubject.next({
      type: 'warning',
      title,
      message
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}