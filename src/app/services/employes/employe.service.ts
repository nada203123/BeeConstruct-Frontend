import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Employe } from '../../models/employe.model';
import { Observable } from 'rxjs';
import { AddEmployeRequest } from '../../models/addEmployeRequest.model';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeService {
  private apiUrl = environment.apiUrlEmploye;
  
  private tokenKey = 'token';
  
  constructor(private http: HttpClient) { }
  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

   // Fetch active sous-traitant employees
   getActiveSoustraitantEmployes(): Observable<Employe[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<Employe[]>(`${this.apiUrl}/employes/soustraitants/active`, { 
      headers
    });
  }

// Fetch active per diem and forfait employees
getActivePerDiemAndPropBeehiveEmployes(): Observable<Employe[]> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
  return this.http.get<Employe[]>(`${this.apiUrl}/employes/active`, { 
    headers
  });
}


  
  // Fetch all archived employees (no type filter)
  getAllArchivedEmployes(): Observable<Employe[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<Employe[]>(`${this.apiUrl}/employes/archived`, { 
      headers
    });
  }
  
  // Updated to include type as part of the request
  addEmploye(employe: AddEmployeRequest): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // Note: The type is now expected to be included in the employe object
    return this.http.post(`${this.apiUrl}/employes`, employe, { headers });
  }
  
  archiveEmploye(id: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`${this.apiUrl}/employes/${id}/archive`, {}, { headers });
  }
      
  restoreEmploye(id: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`${this.apiUrl}/employes/${id}/restore`, {}, { headers });
  }
  
  // Updated to ensure type is part of employeData
  updateEmploye(id: number, employeData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // Note: The type should be included in employeData
    return this.http.put(`${this.apiUrl}/employes/${id}`, employeData, { headers });
  }
  
  deleteEmploye(id: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/employes/${id}/delete`, { headers });
  }

  getAllActiveEmployes(): Observable<Employe[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<Employe[]>(`${this.apiUrl}/employes/active`, { 
      headers
    });
  }
}