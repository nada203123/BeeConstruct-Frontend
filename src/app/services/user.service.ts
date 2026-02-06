import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrlUser;
  private tokenKey = 'token';

  constructor(private http: HttpClient, ) { }
  
  login(email: string, password: string): Observable<any> {
    const loginData = { email, password };
    return this.http.post(`${this.apiUrl}/users/login`, loginData).pipe(
      map(response => {
  
        if (typeof response === 'string') {
          try {
            return JSON.parse(response);
          } catch {
            throw new Error('Format de réponse invalide');
          }
        }
        return response;
      }),
      catchError(error => {
        console.error('Erreur lors de la connexion', error);
        return throwError(() => error);
      })
    );
  }

  forgotPassword(email: string) : Observable<string> {
    const body = { email };
    return this.http.post(`${this.apiUrl}/users/forgot-password`, body, { responseType: 'text' });
  }

  verifyOtp(request: { email: string, otpCode: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/verify-otp`, request , { responseType: 'text' });
  }

  resetPassword(request: { email: string, newPassword: string, confirmPassword: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/reset-password`, request,{ responseType: 'text' });
}

regenerateOtp(email: string): Observable<String> {
  const url = `${this.apiUrl}/users/regenerate-otp`;
  const body = { email }; 

  return this.http.post(url, body, { responseType: 'text' });
}


getUserFromToken(): any {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); 
    return { username: payload.name };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

getEmailFromToken(): any {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { email: payload.email };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}


getCurrentUser(): Observable<any> {

  const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const emailObj = this.getEmailFromToken();
  if (!emailObj || !emailObj.email) {
    throw new Error('No email found in token or no token present');
  }
  console.log("emailobjPhoto",emailObj)
  console.log("Photo",`${this.apiUrl}/users/email/${emailObj.email}`)
  
  return this.http.get(`${this.apiUrl}/users/email/${emailObj.email}`,{ headers });
}



private profilePhotoSubject = new BehaviorSubject<string | null>(null);

profilePhoto$ = this.profilePhotoSubject.asObservable();

updateProfilePhoto(photoPath: string) {
  if (photoPath) {
    // Le backend attend juste le nom du fichier, pas une URL encodée complète
    this.profilePhotoSubject.next(photoPath); // garde uniquement le nom
    console.log("updateProfilePhoto →", photoPath);
  } else {
    this.profilePhotoSubject.next(null);
  }
}







logout(refreshToken: string): Observable<any> {
  const accessToken = localStorage.getItem('token');
  const url = `${this.apiUrl}/users/logout`; 

  if (!accessToken) {
    console.error('No access token found.');
    return new Observable(observer => {
      observer.error('No access token found.');
      observer.complete();
    });
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  });

  return this.http.post(url, { refresh_token: refreshToken }, { headers });
}

getUsers(): Observable<any[]> {
  const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
  return this.http.get<any[]>(`${this.apiUrl}/users`,{ headers });
}

getActiveUsers(): Observable<any[]> {
  const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
  return this.http.get<any[]>(`${this.apiUrl}/users/active`,{ headers });
}

getArchivedUsers(): Observable<any[]> {
  const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
  return this.http.get<any[]>(`${this.apiUrl}/users/archived`,{ headers });
}

archiveUser(id: number): Observable<any> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.patch(`${this.apiUrl}/users/${id}/archive`, {},{ headers });
}


restoreUser(id: number): Observable<any> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.patch(`${this.apiUrl}/users/${id}/restore`, {},{ headers });
}




getUserRole(email: string): Observable<string> {
  
  const token = this.getToken();
    const headers = new HttpHeaders({'Authorization': `Bearer ${token}`,'Content-Type': 'application/json','Accept': 'text/plain'});
    const body = { email: email };
  return this.http.post(`${this.apiUrl}/users/roles`, body ,{ 
    headers: headers ,
    responseType: 'text'
  }).pipe(
    map(role => role.trim()) // Optional: trim any whitespace
  );
}

isAuthenticated(): boolean {
  return !!localStorage.getItem(this.tokenKey);
}
getToken(): string | null {
  return localStorage.getItem(this.tokenKey);
}

deleteUser(userId: any): Observable<any> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.delete(`${this.apiUrl}/users/${userId}`,{ headers });
}

addUser(userData: any): Observable<any> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post<any>(`${this.apiUrl}/users`, userData, { headers });
}

modifyUser(userId: string, userData: any): Observable<any> {

  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, userData, { headers });
}

modifyProfile(userId: string, profileData: FormData): Observable<any> {
  const token = this.getToken();
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.put<any>(`${this.apiUrl}/users/${userId}/profile`, profileData , { headers });
}

getProfilePhotoByUser(userId: string): Observable<Blob> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
  return this.http.get(`${this.apiUrl}/users/${userId}/photo`, {
    headers,
    responseType: 'blob'
  });
}



private userFullNameSubject = new BehaviorSubject<{ firstName: string, lastName: string } | null>(null);
userFullName$ = this.userFullNameSubject.asObservable();

  
  updateUserFullName(firstName: string, lastName: string) {
    this.userFullNameSubject.next({ firstName, lastName });
  }

  modifyPassword(userData: any): Observable<any> {

    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<any>(`${this.apiUrl}/users/password`, userData, { headers , responseType: 'json'});
  }
}
