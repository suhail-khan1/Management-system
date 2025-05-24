import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, User } from './user.service';

fdescribe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:5000/api/users';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch users with GET request', () => {
    const mockUsers: User[] = [
      { _id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
      { _id: '2', name: 'Bob', email: 'bob@example.com', role: 'viewer' }
    ];

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`${apiUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should fetch user by ID with GET request', () => {
    const mockUser: User = { _id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' };

    service.getUser('1').subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${apiUrl}/users/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should update user with PUT request', () => {
    const updatedUser: User = { _id: '1', name: 'Alice', email: 'alice@example.com', role: 'editor' };

    service.updateUser(updatedUser).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/users/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ user: updatedUser });
    req.flush({ success: true });
  });

  it('should delete user with DELETE request', () => {
    service.deleteUser('1').subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/users/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});
