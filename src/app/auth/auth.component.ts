import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';

import {AuthService, LoginResponseData} from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent {
  isLoginMode = true;
  isLoading = false;
  error: string = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;

    this.error=null;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    this.error=null;
    const email = form.value.email;
    const password = form.value.password;
    const firstName = form.value.firstName;
    const lastName = form.value.lastName;
    let authObs: Observable<any>;

    this.isLoading = true;

    if (this.isLoginMode) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.signup(email, password, firstName, lastName);
    }

    authObs.subscribe(
      resData => {
        this.isLoading = false;
        this.router.navigate(['/recipes']);
      },
      errorMessage => {
        this.error = errorMessage;
        this.isLoading = false;
      }
    );

    form.reset();
  }
}
