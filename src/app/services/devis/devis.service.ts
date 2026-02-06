import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DevisService {

   private apiUrl = environment.apiUrlDevis;
   
    private tokenKey = 'token';
  
    constructor(private http: HttpClient) { } 
  
    getToken(): string | null {
      return localStorage.getItem(this.tokenKey);
    }

    getAllActiveDevis(): Observable<any[]> { 
      const token = this.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any[]>(`${this.apiUrl}/devis/active`, { headers }); 
    }

    getAllActiveLatestDevis(): Observable<any[]> { 
      const token = this.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any[]>(`${this.apiUrl}/devis/latest`, { headers }); 
    }

    getActiveDevisByStatus(status: String): Observable<any[]> {
      const token = this.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any[]>(`${this.apiUrl}/devis/active/status/${status}`,{ headers });
    }

     addDevis(devis: any): Observable<any> {
         const token = this.getToken();
         const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
         return this.http.post<any>(`${this.apiUrl}/devis`, devis,{ headers });
       }


       updateDevisStatus(devisId: number, newStatus: string): Observable<any> {
        const token = this.getToken();
        
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    
        // Send the status string directly as the request body
        return this.http.patch<any>(
            `${this.apiUrl}/devis/${devisId}/status`, 
            { status: newStatus },
            { headers }
        );
    }
    
      getDevisHistory(devisId: number): Observable<any[]> {
        const token = this.getToken();
         const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<any[]>(`${this.apiUrl}/devis/${devisId}/history`,{ headers });
      }

      addDevisHistory(file: File | null , devisId: number, comment: string): Observable<any> {
        const token = this.getToken();
  const formData = new FormData();
  
  
  if (file) {
    formData.append('file', file);
}

  formData.append('devisId', devisId.toString());
  formData.append('comment', comment);

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.post<any>(
    `${this.apiUrl}/devis/history`,
    formData,
    { headers }
  ).pipe(
    catchError(error => {
      console.error('Error adding devis history:', error);
      return throwError(() => new Error('Failed to add devis history'));
    })
  );
      }

      getDevisHistoryByDevisId(devisId: number): Observable<any> {
        const token = this.getToken();
        
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
      
        return this.http.get<any>(
          `${this.apiUrl}/devis/${devisId}/history`,
          { headers }
        ).pipe(
          catchError(error => {
            console.error('Error fetching devis history:', error);
            return throwError(() => new Error('Failed to fetch devis history'));
          })
        );
      }


      downloadDevisFile(devisId: number): Observable<Blob> {
        const token = this.getToken();
        
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/octet-stream' // Important for file downloads
        });
      
        return this.http.get(
          `${this.apiUrl}/devis/${devisId}/download`,
          {
            headers: headers,
            responseType: 'blob' // This tells Angular to expect a binary response
          }
        ).pipe(
          catchError(error => {
            console.error('Error downloading devis file:', error);
            return throwError(() => new Error('Failed to download devis file'));
          })
        );
      }

     
      
// Update a devis 
updateDevis(devisId: number, devisData: FormData): Observable<any> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.patch<any>(`${this.apiUrl}/devis/${devisId}`, devisData, { headers });
}



      
   // Fetch archived devis
   getAllArchivedDevis(): Observable<any[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/devis/archived`, { headers }); 
  }


    // Archive a devis 
  archiveDevis(id: number): Observable<void> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<void>(`${this.apiUrl}/devis/${id}/archive`, {}, { headers });
  }


      // Delete a devis
deleteDevis(id: number): Observable<void> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.delete<void>(`${this.apiUrl}/devis/${id}`, { headers });
}

// Restore a devis
restoreDevis(id: number): Observable<void> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.patch<void>(`${this.apiUrl}/devis/${id}/restore`, {}, { headers });
}


























       /*getAllActiveDevisByStatus(): Observable<any[]> {
        const token = this.getToken();
       const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
       return this.http.get<any[]>(`${this.apiUrl}/devis/archived-by-status`,{ headers });
     }*/

     getAllActiveOffers(): Observable<any[]> {
      const token = this.getToken();
     const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
     return this.http.get<any[]>(`${this.apiUrl}/devis/activeOffers`,{ headers });
   }

  /*getHistory(devisId: number): Observable<any[]> {
    const token = this.getToken();
   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
   return this.http.get<any[]>(`${this.apiUrl}/devis/${devisId}/history`,{ headers });
  }*/

  getDevisByID(devisId: number): Observable<any[]> {
    const token = this.getToken();
   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
   return this.http.get<any[]>(`${this.apiUrl}/devis/${devisId}`,{ headers });
  }

  getActiveOffersWithClient(offerId: number ): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(
      `${this.apiUrl}/devis/offers/${offerId}/client`,
      { headers }
    );
  }







}
