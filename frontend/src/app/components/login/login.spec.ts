
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Login } from './login';
import { Authservice } from '../../service/authservice';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceSpy: jasmine.SpyObj<Authservice>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('Authservice', ['login']);
    await TestBed.configureTestingModule({
      imports: [Login, RouterTestingModule],
      providers: [
        { provide: Authservice, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize email and password as empty', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should call authService.login and navigate to dashboard for customer', () => {
    const user = { role: 'customer', name: 'Test User' };
    const token = 'test-token';
    const loginResponse = { data: { login: { token, user } } };
    authServiceSpy.login.and.returnValue(of(loginResponse));
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.email = 'test@test.com';
    component.password = 'password';
    component.onSubmit();
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@test.com', 'password');
    expect(localStorage.getItem('token')).toBe(token);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
    expect(component.successMessage).toBe('Login successful!');
    expect(component.errorMessage).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should call authService.login and navigate to admin-dashboard for admin', () => {
    const user = { role: 'admin', name: 'Admin User' };
    const token = 'admin-token';
    const loginResponse = { data: { login: { token, user } } };
    authServiceSpy.login.and.returnValue(of(loginResponse));
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.email = 'admin@test.com';
    component.password = 'adminpass';
    component.onSubmit();
    expect(authServiceSpy.login).toHaveBeenCalledWith('admin@test.com', 'adminpass');
    expect(localStorage.getItem('token')).toBe(token);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
    expect(localStorage.getItem('isAdmin')).toBe('true');
    expect(localStorage.getItem('adminUser')).toBe(JSON.stringify(user));
    expect(component.successMessage).toBe('Login successful!');
    expect(component.errorMessage).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
  });

  it('should set errorMessage if login fails (no token)', () => {
    const loginResponse = { data: { login: null } };
    authServiceSpy.login.and.returnValue(of(loginResponse));
    component.email = 'fail@test.com';
    component.password = 'failpass';
    component.onSubmit();
    expect(component.errorMessage).toBe('Login failed. Please try again.');
    expect(component.successMessage).toBe('');
  });

  it('should set errorMessage if login throws error', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ message: 'Invalid credentials' })));
    component.email = 'fail@test.com';
    component.password = 'failpass';
    component.onSubmit();
    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.successMessage).toBe('');
  });
});
