import { Component, OnDestroy, OnInit } from '@angular/core';
import { WebSocketNotificationService } from '../../../services/web-socket-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-component',
    template: `
    <div class="notification-container" (click)="showNotifications($event)">
      <div class="badge" *ngIf="notificationCount > 0">{{ notificationCount }}</div>
      <i class="fas fa-bell"></i>
      
      <div class="notification-dropdown" *ngIf="dropdownVisible">
        <div class="notification-header">
          <h3>Notifications</h3>
       
        </div>
        <div class="notification-list" *ngIf="staleOffers.length > 0">
          <div class="notification-item" *ngFor="let offerId of staleOffers">
            <div class="notification-content">
              <span class="notification-title">Offre #{{ offerId }} inactive</span>
              <p class="notification-message">Cette offre n'a pas été mise à jour depuis plus d'un mois </p>
            </div>
           
          </div>
        </div>
        <div class="empty-notification" *ngIf="staleOffers.length === 0">
          Aucune notification
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: relative;
      cursor: pointer;
      margin-right: 10px;
    }

      .notification-container i.fas.fa-bell {
      font-size: 1.5rem; /* Makes the icon larger (24px) */
      color: #555; /* Optional: change the color if needed */
      margin-right:20px;
    }
    
    .badge {
      position: absolute;
      top: -8px;
      right: 18px;
      background-color: #ff4d4f;
      color: white;
      border-radius: 50%;
      width: 15px;
      height: 15px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    
    .notification-dropdown {
      position: absolute;
      top: 30px;
      right: -10px;
      width: 300px;
      background-color: white;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 1000;
    }
    
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
    }
    
    .notification-header h3 {
      margin: 0;
      font-size: 16px;
    }
    
   
    
    .notification-list {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .notification-item {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
    }
    
    .notification-content {
      flex: 1;
    }
    
    .notification-title {
      font-weight: bold;
      display: block;
      margin-bottom: 5px;
    }
    
    .notification-message {
      font-size: 12px;
      color: #777;
      margin: 0;
    }
    
  
    
    .empty-notification {
      padding: 20px;
      text-align: center;
      color: #999;
    }
  `]
})
export class NotificationComponentComponent implements OnInit, OnDestroy {
    notificationCount = 0;
  staleOffers: number[] = [];
  dropdownVisible = false;
  private subscription?: Subscription;
  
  constructor(private notificationService: WebSocketNotificationService) {}
  
  ngOnInit() {
    this.subscription = this.notificationService.getStaleOffers().subscribe(offers => {
      this.staleOffers = offers;
      console.log("stale offersssssss",offers)
      this.notificationCount = offers.length;
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleOutsideClick);
  }
  
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    document.removeEventListener('click', this.handleOutsideClick);
  }
  
  showNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.dropdownVisible = !this.dropdownVisible;
  }
  
  clearNotification(event: MouseEvent, offerId: number) {
    event.stopPropagation();
    this.notificationService.clearStaleOffer(offerId);
  }
  
  clearAllNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.notificationService.clearAllStaleOffers();
  }
  
  handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container') && this.dropdownVisible) {
      this.dropdownVisible = false;
    }
  }

}
