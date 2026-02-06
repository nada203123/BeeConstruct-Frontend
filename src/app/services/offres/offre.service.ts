import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ClientInfo } from '../../models/clientInfo.model';

@Injectable({
  providedIn: 'root'
})
export class OffreService {

  private apiUrl = environment.apiUrlOffre;
 
  private tokenKey = 'token';

  constructor(private http: HttpClient) { }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  

  getAllActiveOffres(): Observable<any[]> {
       const token = this.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any[]>(`${this.apiUrl}/offres/active`,{ headers });
    }


getClientName(offreId: number): Observable<any> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any>(`${this.apiUrl}/offres/${offreId}/client`, { headers });
}

getOffreById(id: number): Observable<any> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any>(`${this.apiUrl}/offres/${id}`, { headers });
}

searchOffres(clientId?: number, localisation?: string, statut?: string, type?: string, dateCreation?: string): Observable<any[]> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
  let url = `${this.apiUrl}/offres/search?`;
  if (clientId) url += `clientId=${clientId}&`;
  if (localisation) url += `localisation=${localisation}&`;
  if (statut) url += `statut=${statut}`;
  if (type) url += `type=${type}`;
  if (dateCreation) url += `dateCreation=${dateCreation}`;
  
  return this.http.get<any[]>(url, { headers });
}

getAllLocalisations(): Observable<string[]> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<string[]>(`${this.apiUrl}/offres/localisations`, { headers });
}

getAllDistinctClients(): Observable<ClientInfo[]> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<ClientInfo[]>(`${this.apiUrl}/offres/distinct-clients`, { headers });
}

createOffre(request: any): Observable<any> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post<any>(`${this.apiUrl}/offres`, request, { headers });
}

updateOffre(id: number, request: any): Observable<any> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.put<any>(`${this.apiUrl}/offres/${id}`, request, { headers });
}

deleteOffre(id: number): Observable<void> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.delete<void>(`${this.apiUrl}/offres/${id}`, { headers });
}

archiveOffre(id: number): Observable<void> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.patch<void>(`${this.apiUrl}/offres/${id}/archive`, null, { headers });
}

restoreOffre(id: number): Observable<void> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.patch<void>(`${this.apiUrl}/offres/${id}/restore`, null, { headers });
}

getAllArchivedOffres(): Observable<any[]> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any[]>(`${this.apiUrl}/offres/archived`, { headers });
}

getAllActiveClients(): Observable<any[]> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any[]>(`${this.apiUrl}/offres/activeClients`, { headers });
}

downloadDevisFile(offreId: number): Observable<Blob> {
        const token = this.getToken();
        
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/octet-stream' 
        });
      
        return this.http.get(
          `${this.apiUrl}/offres/${offreId}/download`,
          {
            headers: headers,
            responseType: 'blob' 
          }
        ).pipe(
          catchError(error => {
            console.error('Error downloading devis file:', error);
            return throwError(() => new Error('Failed to download devis file'));
          })
        );
      }


      
      addHistory(file: File | null , offreId: number, comment: string): Observable<any> {
        const token = this.getToken();
  const formData = new FormData();
  
  
  if (file) {
    formData.append('file', file);
}

  formData.append('offreId', offreId.toString());
  formData.append('comment', comment);

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.post<any>(
    `${this.apiUrl}/offres/history`,
    formData,
    { headers }
  ).pipe(
    catchError(error => {
      console.error('Error adding  history:', error);
      return throwError(() => new Error('Failed to add  history'));
    })
  );
      }

      getHistoryByOffreId(offreId: number): Observable<any> {
        const token = this.getToken();
        
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
      
        return this.http.get<any>(
          `${this.apiUrl}/offres/${offreId}/history`,
          { headers }
        ).pipe(
          catchError(error => {
            console.error('Error fetching devis history:', error);
            return throwError(() => new Error('Failed to fetch devis history'));
          })
        );
      }


      updateOffreStatus(id: number, newStatut: string): Observable<any> {
        const token = this.getToken();
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        
        
        return this.http.patch<any>(
          `${this.apiUrl}/offres/${id}/statut`,
          `"${newStatut}"`,
          { headers }
        ).pipe(
          catchError(error => {
            console.error('Error updating offer status:', error);
            return throwError(() => new Error('Failed to update offer status'));
          })
        );
      }



        checkStaleOffres() {
          const token = this.getToken();
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

    return this.http.get(`${this.apiUrl}/offres/check-stale`, { responseType: 'text', headers  });
  }

  getActiveOffresByStatut(statut: string): Observable<any[]> {
    const token = this.getToken();
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
  
  return this.http.get<any[]>(`${this.apiUrl}/offres/active/${statut}`,{headers});
}

}
