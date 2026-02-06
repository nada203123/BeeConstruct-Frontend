import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export interface Equipment {
  id?: number;
  name: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {

  private apiUrl = environment.apiUrlEquipment; // http://localhost:8095
  private tokenKey = 'token';

  constructor(private http: HttpClient) { }

  // Retrieve the token from localStorage
  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Fetch all equipment (active and inactive) - For search bar
  getAllEquipment(): Observable<Equipment[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Equipment[]>(`${this.apiUrl}/api/equipments`, { headers });
  }

  // Fetch all active equipment - For table display
  getAllActiveEquipment(): Observable<Equipment[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Equipment[]>(`${this.apiUrl}/api/equipments/active`, { headers });
  }
//Fetch all archived equipment
  getAllArchivedEquipment(): Observable<Equipment[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Equipment[]>(`${this.apiUrl}/api/equipments/archived`, { headers });
  }

  // Create a new equipment
  createEquipment(equipment: Equipment): Observable<Equipment> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Equipment>(`${this.apiUrl}/api/equipments`, equipment, { headers });
  }

  // Update an existing equipment
  updateEquipment(id: number, equipment: Equipment): Observable<Equipment> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Equipment>(`${this.apiUrl}/api/equipments/${id}`, equipment, { headers });
  }

  // Archive an equipment
  archiveEquipment(id: number): Observable<Equipment> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<Equipment>(`${this.apiUrl}/api/equipments/${id}/archive`, {}, { headers });
  }
  restoreEquipment(id: number): Observable<Equipment> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<Equipment>(`${this.apiUrl}/api/equipments/${id}/restore`, {}, { headers });
  }

  // Delete an equipment
  deleteEquipment(id: number): Observable<void> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/api/equipments/${id}`, { headers });
  }
}