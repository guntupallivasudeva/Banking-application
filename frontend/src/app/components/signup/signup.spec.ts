import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Signup } from './signup';
import { Authservice } from '../../service/authservice';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('Signup', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;
  let authServiceSpy: jasmine.SpyObj<Authservice>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('Authservice', ['signup']);
    await TestBed.configureTestingModule({
      imports: [Signup, RouterTestingModule],
      providers: [
        { provide: Authservice, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize name, email, password as empty', () => {
    expect(component.name).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should call authService.signup and navigate to login on success', () => {
    const user = { name: 'Test User', email: 'test@test.com' };
    const signupResponse = { data: { createUser: user } };
    authServiceSpy.signup.and.returnValue(of(signupResponse));
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.name = 'Test User';
    component.email = 'test@test.com';
    component.password = 'password';
    component.onSubmit();
    expect(authServiceSpy.signup).toHaveBeenCalledWith('Test User', 'test@test.com', 'password');
    expect(component.successMessage).toBe('Signup successful! Please login.');
    expect(component.errorMessage).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should set errorMessage if signup fails (no user)', () => {
    const signupResponse = { data: { createUser: null } };
    authServiceSpy.signup.and.returnValue(of(signupResponse));
    component.name = 'Fail User';
    component.email = 'fail@test.com';
    component.password = 'failpass';
    component.onSubmit();
    expect(component.errorMessage).toBe('Signup failed. Please try again.');
    expect(component.successMessage).toBe('');
  });

  it('should set errorMessage if signup throws error', () => {
    authServiceSpy.signup.and.returnValue(throwError(() => ({ message: 'Email already exists' })));
    component.name = 'Fail User';
    component.email = 'fail@test.com';
    component.password = 'failpass';
    component.onSubmit();
    expect(component.errorMessage).toBe('Email already exists');
    expect(component.successMessage).toBe('');
  });
});
