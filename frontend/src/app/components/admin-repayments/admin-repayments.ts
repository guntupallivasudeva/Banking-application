import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminLoanService } from '../../service/adminloanservice';

interface LoanAccount {
  _id: string;
  amount: number;
  interestRate: number;
  tenureMonths: number;
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  accountDetails: {
    accountNumber: string;
    type: string;
    balance: number;
  };
  repayments: {
    _id: string;
    dueDate: Date;
    amount: number;
    paid: boolean;
    paidDate?: Date;
  }[];
  totalRepayments: number;
  paidRepayments: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
}

@Component({
  selector: 'app-admin-repayments',
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './admin-repayments.html',
  styleUrl: './admin-repayments.css'
})
export class AdminRepayments implements OnInit {
  loanAccounts: LoanAccount[] = [];
  loading = false;
  selectedLoanAccount: LoanAccount | null = null;

  constructor(
    private router: Router,
    private adminLoanService: AdminLoanService
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
  }

  ngOnInit() {
    this.loadRepayments();
  }

  loadRepayments() {
    this.loading = true;
    
    this.adminLoanService.getAllRepayments().subscribe({
      next: (response: any) => {
        if (response.success && response.loanAccounts) {
          this.loanAccounts = response.loanAccounts;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading loan accounts:', error);
        this.loading = false;
      }
    });
  }



  getStatusClass(paid: boolean): string {
    return paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getStatusText(paid: boolean): string {
    return paid ? 'Paid' : 'Unpaid';
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }

  selectLoanAccount(loanAccount: LoanAccount) {
    this.selectedLoanAccount = loanAccount;
  }

  closeLoanDetails() {
    this.selectedLoanAccount = null;
  }

  getProgressPercentage(loanAccount: LoanAccount): number {
    if (loanAccount.totalRepayments === 0) return 0;
    return Math.round((loanAccount.paidRepayments / loanAccount.totalRepayments) * 100);
  }
}