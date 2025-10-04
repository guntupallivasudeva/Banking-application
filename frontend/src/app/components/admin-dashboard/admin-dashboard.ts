import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';


@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  adminUser: any = {};

  currentDate = new Date();

  constructor(
    private router: Router
  ) {
    this.checkAdminAuth();
  }

  checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // Check if user is authenticated and has admin role
    if (!token || !isAdmin || !user.role || user.role !== 'admin') {
      this.router.navigate(['/admin-login']);
      return;
    }
    
    this.adminUser = user;
  }

  ngOnInit() {
    // No initialization needed
  }

  navigateToLoans() {
    this.router.navigate(['/admin-loans']);
  }

  navigateToAccountDeletion() {
    this.router.navigate(['/account-deletion']);
  }

  navigateToRepayments() {
    this.router.navigate(['/admin-repayments']);
  }

  logout() {
    // Clear all admin-related localStorage
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to admin login page
    this.router.navigate(['/admin-login']);
  }
}