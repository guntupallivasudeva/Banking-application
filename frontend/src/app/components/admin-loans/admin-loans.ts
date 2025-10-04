import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminLoanService } from '../../service/adminloanservice';
import { LoanApplication } from '../../models/loan-application.interface';

@Component({
  selector: 'app-admin-loans',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-loans.html',
  styleUrl: './admin-loans.css'
})
export class AdminLoans implements OnInit {
  loanApplications: LoanApplication[] = [];
  loading = false;
  error = '';
  success = '';
  
  // Modal properties
  selectedLoan: LoanApplication | null = null;
  showApprovalModal = false;
  showDeclineModal = false;
  
  // Approval form data
  approvedInterestRate = 8.5;
  approvedTerm = 12;
  declineReason = '';
adminUser: any;

  constructor(
    private adminLoanService: AdminLoanService,
    private router: Router
  ) {
    // Check admin authentication on initialization
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
    this.loadLoanApplications();
  }

  loadLoanApplications() {
    this.loading = true;
    this.error = '';
    
    this.adminLoanService.getAllLoans().subscribe({
      next: (response) => {
        this.loanApplications = response.loans || response;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load loan applications';
        this.loading = false;
        console.error('Error loading loans:', error);
      }
    });
  }

  openApprovalModal(loan: LoanApplication) {
    this.selectedLoan = loan;
    this.showApprovalModal = true;
    // Set default values based on loan type
    this.setDefaultApprovalValues(loan);
  }

  openDeclineModal(loan: LoanApplication) {
    this.selectedLoan = loan;
    this.showDeclineModal = true;
    this.declineReason = '';
  }

  closeModals() {
    this.showApprovalModal = false;
    this.showDeclineModal = false;
    this.selectedLoan = null;
    this.declineReason = '';
  }

  setDefaultApprovalValues(loan: LoanApplication) {
    // Set interest rates based on loan type
    switch (loan.loanType) {
      case 'Personal':
        this.approvedInterestRate = 10.5;
        this.approvedTerm = 24;
        break;
      case 'Home':
        this.approvedInterestRate = 7.5;
        this.approvedTerm = 240; // 20 years
        break;
      case 'Auto':
        this.approvedInterestRate = 8.5;
        this.approvedTerm = 60; // 5 years
        break;
      case 'Business':
        this.approvedInterestRate = 12.0;
        this.approvedTerm = 36;
        break;
      case 'Education':
        this.approvedInterestRate = 9.0;
        this.approvedTerm = 48; // 4 years
        break;
      case 'Gold':
        this.approvedInterestRate = 11.0;
        this.approvedTerm = 24;
        break;
      case 'Medical':
        this.approvedInterestRate = 9.5;
        this.approvedTerm = 36;
        break;
      case 'Wedding':
        this.approvedInterestRate = 10.0;
        this.approvedTerm = 24;
        break;
      case 'Travel':
        this.approvedInterestRate = 10.5;
        this.approvedTerm = 18;
        break;
      default:
        this.approvedInterestRate = 10.0;
        this.approvedTerm = 12;
    }
  }

  calculateMonthlyPayment(): number {
    if (!this.selectedLoan) return 0;
    
    const principal = this.selectedLoan.amount;
    const monthlyRate = this.approvedInterestRate / 100 / 12;
    const numPayments = this.approvedTerm;
    
    if (monthlyRate === 0) {
      return principal / numPayments;
    }
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return Math.round(monthlyPayment * 100) / 100;
  }

  approveLoan() {
    if (!this.selectedLoan) return;
    
    const approvalData = {
      interestRate: this.approvedInterestRate,
      term: this.approvedTerm,
      monthlyPayment: this.calculateMonthlyPayment(),
      approvedDate: new Date()
    };
    
    this.adminLoanService.approveLoan(this.selectedLoan._id, approvalData).subscribe({
      next: (response) => {
        this.success = 'Loan approved successfully';
        this.loadLoanApplications();
        this.closeModals();
        setTimeout(() => this.success = '', 5000);
      },
      error: (error) => {
        this.error = 'Failed to approve loan';
        console.error('Error approving loan:', error);
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  declineLoan() {
    if (!this.selectedLoan || !this.declineReason.trim()) {
      this.error = 'Please provide a reason for declining the loan';
      return;
    }
    
    this.adminLoanService.declineLoan(this.selectedLoan._id, this.declineReason).subscribe({
      next: (response) => {
        this.success = 'Loan declined successfully';
        this.loadLoanApplications();
        this.closeModals();
        setTimeout(() => this.success = '', 5000);
      },
      error: (error) => {
        this.error = 'Failed to decline loan';
        console.error('Error declining loan:', error);
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Closed': return 'bg-purple-100 text-purple-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  logout() {
    // Clear all admin-related localStorage
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to admin login page
    this.router.navigate(['/admin-login']);
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }
}
