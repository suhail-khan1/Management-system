import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SignUpComponent } from './sign-up.component';
import { AuthenticationService } from '../authentication.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthenticationService', ['signup']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatSnackBarModule, MatCardModule, MatInputModule, MatFormFieldModule, MatSelectModule, BrowserAnimationsModule],
      declarations: [SignUpComponent],
      providers: [
        { provide: AuthenticationService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: MatSnackBar, useValue: snackBarSpyObj }
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create form with name, email, password and role controls', () => {
    expect(component.signupForm.contains('name')).toBeTrue();
    expect(component.signupForm.contains('email')).toBeTrue();
    expect(component.signupForm.contains('password')).toBeTrue();
    expect(component.signupForm.contains('role')).toBeTrue();
  });

  it('should validate required fields and email format', () => {
    const name = component.signupForm.get('name');
    const email = component.signupForm.get('email');
    const password = component.signupForm.get('password');
    const role = component.signupForm.get('role');

    name?.setValue('');
    email?.setValue('invalid-email');
    password?.setValue('');
    role?.setValue('');

    expect(name?.valid).toBeFalse();
    expect(email?.valid).toBeFalse();
    expect(password?.valid).toBeFalse();
    expect(role?.valid).toBeFalse();

    name?.setValue('Test User');
    email?.setValue('test@example.com');
    password?.setValue('password123');
    role?.setValue('admin');

    expect(name?.valid).toBeTrue();
    expect(email?.valid).toBeTrue();
    expect(password?.valid).toBeTrue();
    expect(role?.valid).toBeTrue();
  });

  it('should call signup and navigate on successful signup', fakeAsync(() => {
    authServiceSpy.signup.and.returnValue(of(void 0));
    component.signupForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });

    component.signup();
    tick();

    expect(authServiceSpy.signup).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });
    expect(snackBarSpy.open).toHaveBeenCalledWith('Signup successful!', 'Close', { duration: 3000 });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  }));

  it('should show error snackbar on signup failure', fakeAsync(() => {
    authServiceSpy.signup.and.returnValue(throwError(() => new Error('Signup error')));
    component.signupForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });

    component.signup();
    tick();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Signup failed!', 'Close', { duration: 3000 });
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));

  it('should not call signup if form is invalid', () => {
    component.signupForm.setValue({
      name: '',
      email: 'invalid-email',
      password: '',
      role: ''
    });

    component.signup();

    expect(authServiceSpy.signup).not.toHaveBeenCalled();
  });

  it('should unsubscribe all subscriptions on destroy', () => {
    spyOn(component['subscriptions'], 'unsubscribe');

    component.ngOnDestroy();

    expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
  });
});
