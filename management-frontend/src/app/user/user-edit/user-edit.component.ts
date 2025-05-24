import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService, User } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  userId!: string | null;
  roles: string[] = ['admin', 'editor', 'viewer'];
  user: User;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');

    this.userForm = this.fb.group({
      name: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      role: ['', Validators.required]
    });

    this.userService.selectedUser$.subscribe((user: User) => {
      if (user && user._id === this.userId) {
        this.user = user;
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role
        });
      } else if (this.userId) {
        const userSubscription = this.userService.getUser(this.userId).subscribe({
          next: (user: User) => {
            this.userForm.patchValue({
              name: user.name,
              email: user.email,
              role: user.role
            });
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Failed to get user.', 'Close', { duration: 3000 });
          }
        });

        this.subscriptions.add(userSubscription);
      }
    });
  }

  updateRole(): void {
    if (this.userForm.valid && this.userId) {
      const userUpdateSubscription = this.userService.updateUser(this.user).subscribe({
        next: () => {
          this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['dashboard/users']);
        },
        error: (err) => {
          console.error('Failed to update user role:', err);
          this.snackBar.open('Failed to update user.', 'Close', { duration: 3000 });
        }
      });
      this.subscriptions.add(userUpdateSubscription);
    }
  }

  cancel(): void {
    this.userForm.reset();
    this.router.navigate(['dashboard/users']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
