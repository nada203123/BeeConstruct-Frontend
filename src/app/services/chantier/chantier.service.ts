import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class ChantierService {
  private apiUrl = environment.apiUrlChantier;
  private tokenKey = 'token';

  constructor(private http: HttpClient) { }

 

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getAllChantiers(): Observable<any> { 
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/chantiers`, { headers }); 
  }

  getChantierById(chantierId: number): Observable<any> { 
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/chantiers/${chantierId}`, { headers }); 
  }

  updateChantier(chantierId: number, updatedChantier: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.apiUrl}/chantiers/${chantierId}`, updatedChantier, { headers });
  }
  
  updateChantierStatus(chantierId: number, status: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<any>(`${this.apiUrl}/chantiers/${chantierId}/status?status=${status}`, null, { headers });
  }

  
}