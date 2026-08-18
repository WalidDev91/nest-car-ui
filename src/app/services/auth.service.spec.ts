import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const storage = new Map<string, string>();

  const localStorageMock = {
    getItem: (key: string): string | null => {
      return storage.has(key) ? storage.get(key)! : null;
    },

    setItem: (key: string, value: string): void => {
      storage.set(key, value);
    },

    removeItem: (key: string): void => {
      storage.delete(key);
    },

    clear: (): void => {
      storage.clear();
    },

    key: (index: number): string | null => {
      return Array.from(storage.keys())[index] ?? null;
    },

    get length(): number {
      return storage.size;
    }
  };

  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true
    });

    localStorageMock.clear();

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
    localStorageMock.clear();
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
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
    expect(req.request.body).toBeInstanceOf(FormData);

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
    expect(req.request.body).toBeInstanceOf(FormData);

    const formData = req.request.body as FormData;

    expect(formData.has('user')).toBe(true);
    expect(formData.has('image')).toBe(false);

    req.flush({
      message: 'Registration successful'
    });
  });

  it('should remove authentication data on logout', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('role', 'DRIVER');
    localStorage.setItem('email', 'test@example.com');
    localStorage.setItem('firstName', 'Test');
    localStorage.setItem('lastName', 'User');
    localStorage.setItem('userId', '123');
    localStorage.setItem('imageUrl', '/uploads/test.jpg');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(localStorage.getItem('email')).toBeNull();
    expect(localStorage.getItem('firstName')).toBeNull();
    expect(localStorage.getItem('lastName')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('imageUrl')).toBeNull();
  });
});