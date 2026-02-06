import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Document } from '../../models/document.model';
import { catchError, Observable, throwError, map } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = environment.apiUrlChantier;

  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getDocumentsByChantierId(chantierId: number): Observable<Document[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Document[]>(`${this.apiUrl}/documents/chantier/${chantierId}`, { headers });
  }

  uploadDocument(chantierId: number, file: File, isContract: boolean = false): Observable<Document> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('chantierId', chantierId.toString());
    formData.append('file', file, file.name);
    formData.append('isContract', isContract.toString()); 
    return this.http.post<Document>(`${this.apiUrl}/documents`, formData, { headers });
  }

  deleteDocument(id: number): Observable<void> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/documents/${id}`, { headers });
  }

  downloadDocument(id: number): Observable<Blob> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/documents/${id}/download`, {
      headers: headers,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<Blob>) => {
        const blob = response.body;
        if (!blob) {
          throw new Error('No blob data received from server');
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let fileName = `document_${id}`; // Fallback
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.split('filename=')[1];
          if (fileNameMatch) {
            fileName = fileNameMatch.replace(/"/g, ''); // Remove quotes
          }
        }
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return blob; // Explicitly return the blob
      }),
      catchError(error => {
        console.error('Error downloading document:', error);
        return throwError(() => new Error('Failed to download document'));
      })
    );
  }
}