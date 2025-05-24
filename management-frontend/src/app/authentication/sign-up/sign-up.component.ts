import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService, User } from '../authentication.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnDestroy{

  roles: string[] = ['admin', 'editor', 'viewer'];

  signupForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: ['', Validators.required]
  });

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  signup() {
    if (this.signupForm.valid) {
      const signupSubscription = this.authService.signup(this.signupForm.value as User).subscribe({
        next: () => {
          this.snackBar.open('Signup successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          this.snackBar.open('Signup failed!', 'Close', { duration: 3000 });
        }
      });

      this.subscriptions.add(signupSubscription);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

