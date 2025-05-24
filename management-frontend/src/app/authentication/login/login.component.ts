import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService, User } from '../authentication.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy{
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  login() {
    if (this.loginForm.valid) {
      const loginSubscription = this.authService.login(this.loginForm.value as User).subscribe({
        next: (data) => {
          sessionStorage.setItem('token', data);
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.snackBar.open('Login failed!', 'Close', { duration: 3000 });
        }
      });
      this.subscriptions.add(loginSubscription);
    }
  }

  logout() {
    if (sessionStorage.getItem('token')) {
      sessionStorage.removeItem('token');
    }
  }

  routeToSignup() {
    this.router.navigate(['auth/signup']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
