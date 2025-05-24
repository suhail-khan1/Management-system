import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, User } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../shared/components/confirm-delete-dialog/confirm-delete-dialog.component';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  displayedColumns: string[] = ['name', 'email', 'role', 'actions'];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    const usersSubscription = this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.snackBar.open('Failed to get users.', 'Close', { duration: 3000 });
      }
    });
    this.subscriptions.add(usersSubscription);
  }

  editUser(user: User) {
    this.userService.setSelectedUser(user);
    this.router.navigate(['dashboard/users/edit', user._id]);
  }

  confirmDeleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '300px',
      data: { name: user.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteUser(user._id);
      }
    });
  }

  deleteUser(userId: string) {
   const deleteSubscription =  this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        this.snackBar.open('Failed to delete user.', 'Close', { duration: 3000 });
      }
    });
    this.subscriptions.add(deleteSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}