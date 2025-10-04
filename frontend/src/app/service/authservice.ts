import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Authservice {
  private base = 'http://localhost:8000/api/auth';
  constructor(private http: HttpClient, private router: Router) { }

  signup(name: string, email: string, password: string) {
    return firstValueFrom(this.http.post(`${this.base}/signup`, { name, email, password }));
  }

  login(email: string, password: string) {
    return firstValueFrom(this.http.post(`${this.base}/login`, { email, password }));
  }

  async adminLogin(email: string, password: string): Promise<any> {
    try {
      const result: any = await firstValueFrom(this.http.post(`${this.base}/admin/login`, { email, password }));
      const { token, user } = result;
      if (user.role !== 'admin') {
        return { success: false, message: 'Access denied. Admin privileges required.' };
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user, token };
    } catch (err: any) {
      return { success: false, message: err?.error?.error || err.message || 'Invalid admin credentials' };
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUser');
    this.router.navigate(['/']);
  }
}
