import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthenticationService } from '../authentication.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthenticationService', ['login']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatSnackBarModule, MatCardModule, MatFormFieldModule, MatInputModule, BrowserAnimationsModule],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthenticationService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: MatSnackBar, useValue: snackBarSpyObj }
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create form with email and password controls', () => {
    expect(component.loginForm.contains('email')).toBeTrue();
    expect(component.loginForm.contains('password')).toBeTrue();
  });

  it('should make email control required and validate email format', () => {
    const email = component.loginForm.get('email');

    email?.setValue('');
    expect(email?.valid).toBeFalse();

    email?.setValue('not-an-email');
    expect(email?.valid).toBeFalse();

    email?.setValue('test@example.com');
    expect(email?.valid).toBeTrue();
  });

  it('should make password control required', () => {
    const password = component.loginForm.get('password');

    password?.setValue('');
    expect(password?.valid).toBeFalse();

    password?.setValue('validpassword');
    expect(password?.valid).toBeTrue();
  });

  it('should login successfully, store token, show snackbar, and navigate', fakeAsync(() => {
    const token = 'mock-jwt-token';
    authServiceSpy.login.and.returnValue(of(token));
    component.loginForm.setValue({ email: 'test@example.com', password: 'password123' });

    spyOn(sessionStorage, 'setItem');

    component.login();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    expect(sessionStorage.setItem).toHaveBeenCalledWith('token', token);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Login successful!', 'Close', { duration: 3000 });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should show error snackbar on login failure', fakeAsync(() => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Login error')));
    component.loginForm.setValue({ email: 'test@example.com', password: 'password123' });

    component.login();
    tick();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Login failed!', 'Close', { duration: 3000 });
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));

  it('should not call login if form is invalid', () => {
    component.loginForm.setValue({ email: 'invalid-email', password: '' });

    component.login();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should remove token from sessionStorage on logout', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('token');
    spyOn(sessionStorage, 'removeItem');

    component.logout();

    expect(sessionStorage.getItem).toHaveBeenCalledWith('token');
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should navigate to signup page', () => {
    component.routeToSignup();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['auth/signup']);
  });

  it('should unsubscribe all subscriptions on destroy', () => {
    spyOn(component['subscriptions'], 'unsubscribe');

    component.ngOnDestroy();

    expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
  });
});
