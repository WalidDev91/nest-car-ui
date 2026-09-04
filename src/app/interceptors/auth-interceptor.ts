import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const token = localStorage.getItem('token');

  // Do not attach JWT to public authentication endpoints.
  const isAuthRequest = req.url.includes('/auth/');

  if (token && !isAuthRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {

        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');

        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};