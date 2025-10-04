import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Authservice } from '../service/authservice';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: Authservice,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/admin-login']);
      return false;
    }

    // Check if user has admin role
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (user.role === 'admin' && isAdmin) {
      return true;
    }

    // If not admin, redirect to admin login
    this.router.navigate(['/admin-login']);
    return false;
  }
}