import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();

    TestBed.resetTestingModule();

    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send login credentials to the login endpoint', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    service.login(credentials).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/auth/login`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);

    req.flush({
      token: 'fake-jwt-token'
    });
  });

  it('should register a user with user data and image', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test'
    };

    const image = new File(
      ['fake image'],
      'profile.jpg',
      { type: 'image/jpeg' }
    );

    service.register(userData, image).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/auth/register`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);

    const formData = req.request.body as FormData;

    expect(formData.has('user')).toBe(true);
    expect(formData.has('image')).toBe(true);
    expect(formData.get('image')).toEqual(image);

    req.flush({
      message: 'Registration successful'
    });
  });

  it('should register a user without an image', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    service.register(userData, null).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/auth/register`
    );

    expect(req.request.method).toBe('POST');

    const formData = req.request.body as FormData;

    expect(formData.has('user')).toBe(true);
    expect(formData.has('image')).toBe(false);

    req.flush({
      message: 'Registration successful'
    });
  });

  it('should remove authentication data on logout', () => {
    const storage = globalThis.localStorage;

    storage.setItem('token', 'fake-token');
    storage.setItem('role', 'DRIVER');
    storage.setItem('email', 'test@example.com');
    storage.setItem('firstName', 'Test');
    storage.setItem('lastName', 'User');
    storage.setItem('userId', '123');
    storage.setItem('imageUrl', '/uploads/test.jpg');

    service.logout();

    expect(storage.getItem('token')).toBeNull();
    expect(storage.getItem('role')).toBeNull();
    expect(storage.getItem('email')).toBeNull();
    expect(storage.getItem('firstName')).toBeNull();
    expect(storage.getItem('lastName')).toBeNull();
    expect(storage.getItem('userId')).toBeNull();
    expect(storage.getItem('imageUrl')).toBeNull();
  });
});