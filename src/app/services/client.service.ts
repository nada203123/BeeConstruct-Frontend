import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Client } from '../models/client.model';
import { catchError, Observable, throwError } from 'rxjs';
import { AddClientRequest } from '../models/add-client-request.model';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
    private apiUrl = environment.apiUrlClient;
 
  private tokenKey = 'token';

  constructor(private http: HttpClient) { }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  

  getAllActiveClients(): Observable<Client[]> {
     const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Client[]>(`${this.apiUrl}/clients/active`,{ headers });
  }

  getAllArchivedClients(): Observable<Client[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Client[]>(`${this.apiUrl}/clients/archived`,{ headers });
  }

  addClient(client: any): Observable<Client> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Client>(`${this.apiUrl}/clients`, client,{ headers });
  }

  
  archiveClient(id: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`${this.apiUrl}/clients/${id}/archive`, {},{ headers });
  }

  
  restoreClient(id: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`${this.apiUrl}/clients/${id}/restore`, {},{ headers });
  }

  
  updateClient(id: number, clientData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/clients/${id}`, clientData,{ headers })
  
  }

  deleteClient(id: number): Observable<void> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/clients/${id}/delete`,{ headers });
  }
  
}
