import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { log } from 'console';
import { catchError, Observable, switchMap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  private tokenKey = 'token';



  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     let token = localStorage.getItem(this.tokenKey);
    console.log(token)

    if (token) {
      console.log(token)
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
          
        }
      });
      return next.handle(cloned);
    
    }

    return next.handle(req);
  }




}



