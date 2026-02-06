import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

interface SalaryRequestDTO {
  situationId: number;
  perDiemSalaries: { employeeId: number; fixedSalary: number }[];
  subcontractorAllocation?: number;
  otherCharges?: number;
}

interface SalaryResponseDTO {
  employeeId: number;
  employeeName: string;
  employeeType: string;
  salaryAmount: number;
  month: string;
  calculationDetails: string;
  advance?: number;
  rent?: number;
  contribution?: number;
  netSalary?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SalaryService {
  private apiUrl = environment.apiUrlChantier;
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

getSalariesBySituationId(situationId: number): Observable<any[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/salaire/situation/${situationId}`, { headers });
}

 addRetenue(situationId: number,employeeId: number,typeRetenue: string,montant: number): Observable<any> {
   const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
      .set('type', typeRetenue)
      .set('montant', montant.toString());


    return this.http.post<any>( `${this.apiUrl}/salaire/${situationId}/${employeeId}/retenue`,null, { headers: headers, params: params });
  }

}