import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface User {
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/users`;

  private selectedUserSource = new BehaviorSubject<User | null>(null);
  selectedUser$ = this.selectedUserSource.asObservable();

  constructor(private http: HttpClient) { }

  setSelectedUser(user: User) {
    this.selectedUserSource.next(user);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUser(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  updateUser(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${user._id}`, { user });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }
}
