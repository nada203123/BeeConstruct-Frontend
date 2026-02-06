import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface CreatePointageDto {
  situationId: number;
  employeId: number;
  heuresParJour: { [key: string]: number }; // Required field matching backend
}

export interface PointageResponseDto {
  id: number;
  situationId: number;
  employeId: number;
  heuresParJour: { [key: string]: number }; // Map of date strings to hours
  totalHeures: number;                     // Total hours worked
  nombreJoursTravailles: number;           // Number of worked days
}


@Injectable({
  providedIn: 'root'
})
export class PointageService {
  private apiUrl = environment.apiUrlChantier;
   private tokenKey = 'token';

  constructor(private http: HttpClient) { }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentMonthDays(year: number, month: number): Date[] {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Date[] = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }

  
  getMonthName(monthIndex: number): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[monthIndex];
  }

  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  }


  getDaysOfWeek(): string[] {
    return ['L', 'M', 'M', 'J', 'V', 'S', 'D']; // Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche
  }

 
  getFullDayNames(): string[] {
    return ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  }

   getPointageBySituationAndEmploye(situationId: number, employeId: number): Observable<PointageResponseDto> {
    const params = new HttpParams()
      .set('situationId', situationId.toString())
      .set('employeId', employeId.toString());

      const token = this.getToken();
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<PointageResponseDto>(`${this.apiUrl}/pointage/by-situation-employe`, { params , headers });
  }

   getTotalNombreJoursTravaillesBySituationId(situationId: number): Observable<number> {

     const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
   
    return this.http.get<number>(`${this.apiUrl}/pointage/situation/${situationId}/total-jours-travailles`,{ headers });
  }

  calculateTotalHoursPerDay(heuresParJour: { [key: string]: number }): number {
    return Object.values(heuresParJour || {}).reduce((total, hours) => total + hours, 0);
  }

  createPointage(createPointageDto: CreatePointageDto): Observable<PointageResponseDto> {
      const token = this.getToken();
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<PointageResponseDto>(`${this.apiUrl}/pointage`, createPointageDto,{ headers });
  }

  
  getAllPointages(): Observable<PointageResponseDto[]> {
    return this.http.get<PointageResponseDto[]>(`${this.apiUrl}/pointage`);
  }

 
  getPointageById(id: number): Observable<PointageResponseDto> {
    return this.http.get<PointageResponseDto>(`${this.apiUrl}/pointage/${id}`);
  }

   updateHeuresJour(id: number, date: string, heures: number): Observable<PointageResponseDto> {
         const token = this.getToken();
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<PointageResponseDto>(`${this.apiUrl}/pointage/${id}/heures/${date}`, heures,{ headers })
  }

  setAllHeuresToEight(id: number): Observable<PointageResponseDto> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<PointageResponseDto>(`${this.apiUrl}/pointage/${id}/set-all-to-eight`,{},{ headers });
  }

  setAllHeuresToZero(id: number): Observable<PointageResponseDto> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<PointageResponseDto>(`${this.apiUrl}/pointage/${id}/set-all-to-zero`,{},{ headers });
  }
  
}
