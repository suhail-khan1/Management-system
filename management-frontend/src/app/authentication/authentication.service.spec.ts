import { TestBed } from '@angular/core/testing';
import { AuthenticationService, User } from './authentication.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5000/api/auth';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthenticationService]
    });
    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send login request and return response', () => {
    const dummyResponse = { token: 'fake-jwt-token' };
    const credentials = { email: 'test@example.com', password: '123456' };

    service.login(credentials).subscribe(res => {
      expect(res).toEqual(dummyResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(dummyResponse);
  });

  it('should send signup request and return response', () => {
    const dummyResponse = { message: 'User created' };
    const user: User = {
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
      role: 'viewer'
    };

    service.signup(user).subscribe(res => {
      expect(res).toEqual(dummyResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/signup`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);
    req.flush(dummyResponse);
  });
});
