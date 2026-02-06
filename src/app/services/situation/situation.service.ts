import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SituationService {
  private apiUrl = environment.apiUrlChantier;

  private tokenKey = 'token';

  constructor(private http: HttpClient) { }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

   getAllSituations(): Observable<any> { 
      const token = this.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(`${this.apiUrl}/situations`, { headers }); 
    }

    getSituationById(situationId: number): Observable<any> { 
      const token = this.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(`${this.apiUrl}/situations/${situationId}`, { headers }); 
    }

    getSituationByChantierId(chantierId: number): Observable<any> { 
      const token = this.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(`${this.apiUrl}/situations/chantier/${chantierId}`, { headers }); 
    }

    createSituation(situationData: any): Observable<any> {
      const token = this.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<any>(`${this.apiUrl}/situations`, situationData, { headers });
    }

    deleteSituation(situationId: number): Observable<void> {
      const token = this.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.delete<void>(`${this.apiUrl}/situations/${situationId}`,{ headers });
    }

     updateSituation(id: number, situationData: any): Observable<any> {
       const token = this.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/situations/${id}`, situationData, { headers });
  }
  


}
