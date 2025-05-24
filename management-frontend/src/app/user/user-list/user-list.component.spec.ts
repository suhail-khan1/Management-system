import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService, User } from '../user.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of, Subject, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

fdescribe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockUsers: User[] = [
    { _id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
    { _id: '2', name: 'Bob', email: 'bob@example.com', role: 'viewer' },
  ];

  beforeEach(async () => {
    const userServiceMock = jasmine.createSpyObj('UserService', ['getUsers', 'setSelectedUser', 'deleteUser']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule, BrowserAnimationsModule, MatCardModule, MatTableModule],
      declarations: [UserListComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    userServiceSpy.getUsers.and.returnValue(of(mockUsers));
    userServiceSpy.deleteUser.and.returnValue(of(null));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    component.ngOnInit();
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
    expect(component.users.length).toBe(2);
  });

  it('should open snackbar on load users error', () => {
    userServiceSpy.getUsers.and.returnValue(throwError(() => new Error('Error')));
    spyOn(console, 'error');
    component.loadUsers();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to get users.', 'Close', { duration: 3000 });
  });

  it('should navigate to edit page with selected user', () => {
    component.editUser(mockUsers[0]);
    expect(userServiceSpy.setSelectedUser).toHaveBeenCalledWith(mockUsers[0]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['dashboard/users/edit', mockUsers[0]._id]);
  });

  it('should open confirm delete dialog and delete user on confirm', fakeAsync(() => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
    dialogSpy.open.and.returnValue(dialogRefSpyObj);

    spyOn(component, 'deleteUser');

    component.confirmDeleteUser(mockUsers[0]);
    tick();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(component.deleteUser).toHaveBeenCalledWith(mockUsers[0]._id);
  }));

  it('should not delete user if dialog is cancelled', fakeAsync(() => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null });
    dialogSpy.open.and.returnValue(dialogRefSpyObj);

    spyOn(component, 'deleteUser');

    component.confirmDeleteUser(mockUsers[0]);
    tick();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(component.deleteUser).not.toHaveBeenCalled();
  }));

  it('should call deleteUser and reload users on success', () => {
    spyOn(component, 'loadUsers');
    component.deleteUser(mockUsers[0]._id);

    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(mockUsers[0]._id);
    expect(component.loadUsers).toHaveBeenCalled();
  });

  it('should show snackbar on delete user error', () => {
    userServiceSpy.deleteUser.and.returnValue(throwError(() => new Error('Delete error')));
    spyOn(console, 'error');
    component.deleteUser('1');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to delete user.', 'Close', { duration: 3000 });
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
  });
});
