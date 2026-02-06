import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { Commande } from '../../models/commande.model';

@Injectable({
  providedIn: 'root'
})
export class MarchandiseService {
  private apiUrl = environment.apiUrlChantier;

  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCommandesByChantierIdAndSituationId(chantierId: number, situationId: number | null): Observable<Commande[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = situationId ? `${this.apiUrl}/commandes/chantier/${chantierId}/situation/${situationId}` : `${this.apiUrl}/commandes/chantier/${chantierId}`;
    return this.http.get<Commande[]>(url, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching commandes:', error);
        return throwError(() => new Error('Failed to fetch commandes'));
      })
    );
  }

  addCommande(commande: Commande): Observable<Commande> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Commande>(`${this.apiUrl}/commandes`, commande, { headers });
  }

  updateCommande(id: number, commande: Commande): Observable<Commande> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Commande>(`${this.apiUrl}/commandes/${id}`, commande, { headers });
  }

  deleteCommande(id: number): Observable<void> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/commandes/${id}`, { headers });
  }

  getCommandeById(id: number): Observable<Commande> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Commande>(`${this.apiUrl}/commandes/${id}`, { headers });
  }

  getTotalTTCByChantierId(chantierId: number): Observable<number> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<number>(`${this.apiUrl}/commandes/chantier/${chantierId}/total-ttc`, { headers });
  }

  getDistinctFournisseurs(): Observable<string[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<string[]>(`${this.apiUrl}/commandes/fournisseurs`, { headers });
  }

  getCommandesByChantierId(chantierId: number): Observable<Commande[]> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.apiUrl}/commandes/chantier/${chantierId}`;
  return this.http.get<Commande[]>(url, { headers }).pipe(
    catchError(error => {
      console.error('Error fetching commandes:', error);
      return throwError(() => new Error('Failed to fetch commandes'));
    })
  );
}

getTotalTTCByChantierIdAndSituationId(chantierId: number, situationId: number): Observable<number> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.apiUrl}/commandes/chantier/${chantierId}/situation/${situationId}/total-ttc`;
  return this.http.get<number>(url, { headers });
}


}