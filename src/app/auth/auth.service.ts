import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, last, tap} from 'rxjs/operators';
import {throwError, BehaviorSubject} from 'rxjs';

import {User} from './user.model';
import {environment} from '../../environments/environment';

export interface LoginResponseData {
  token_type: string;
  access_token: string;
  email: string;
  refresh_token: string;
  expires_in: number;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {
  }

  signup(email: string, password: string, firstName: string, lastName: string) {
    return this.http
      .post(
        environment.signupUrl,
        {
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName
        }
      )
      .pipe(
        catchError(this.handleError)
      );
  }

  login(email: string, password: string) {
    console.log('login called');
    return this.http
      .post<LoginResponseData>(
        environment.loginUrl,
        new HttpParams()
          .set('username', email)
          .set('password', password)
          .set('grant_type', 'password'),
        {
          headers: new HttpHeaders().append('Authorization',
            'Basic ' + btoa(`3378211794637249:55217995243224261`))
        }
      )
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(
            resData.access_token,
            resData.expires_in,
            resData.refresh_token
          );
        })
      );
  }

  autoLogin() {
    let accessToken;
    let expiresIn;
    let refreshToken;
    console.log(localStorage.getItem('userData'))
    JSON.parse(localStorage.getItem('userData'), (key, value) => {
      switch (key) {
        case 'accessToken':
          accessToken = value;
          break;
        case 'expiresIn':
          expiresIn = value;
          break;
        case 'refreshToken':
          refreshToken = value;
      }
    });

    const loadedUser = new User(accessToken, expiresIn, refreshToken);

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = new Date(expiresIn).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(
    accessToken: string,
    expiresIn: number,
    refreshToken: string
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(accessToken, expirationDate, refreshToken);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorRes: HttpErrorResponse) {
    console.log(errorRes)
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
      default:
        errorMessage = errorRes.error.message;
    }
    return throwError(errorMessage);
  }
}
