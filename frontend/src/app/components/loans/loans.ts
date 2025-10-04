import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Loanservice } from '../../service/loanservice';
import { Accountservice } from '../../service/accountservice';
import { UserLoan, SimpleLoanApplication } from '../../models/loan-application.interface';

@Component({
  selector: 'app-loans',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './loans.html',
  styleUrl: './loans.css'
})
export class Loans implements OnInit {
  loans: UserLoan[] = [];
  accounts: any[] = [];
  errorMessage = '';
  successMessage = '';
  showLoanForm = false;
  
  // Loan application form data
  loanApplication: SimpleLoanApplication = {
    loanType: 'Personal',
    amount: 0,
    tenureMonths: 0,
    interestRate: 8.5, // Default interest rate
    accountId: ''
  };

  // Predefined loan types and their typical interest rates
  loanTypes = [
    { type: 'Personal', interestRate: 12.5, description: 'Personal loans for any purpose' },
    { type: 'Home', interestRate: 8.5, description: 'Home loans for buying property' },
    { type: 'Education', interestRate: 10.0, description: 'Education loans for studies' },
    { type: 'Auto', interestRate: 9.5, description: 'Auto loans for vehicle purchase' },
    { type: 'Business', interestRate: 11.0, description: 'Business loans for entrepreneurs' },
    { type: 'Medical', interestRate: 13.0, description: 'Medical emergency loans for healthcare' },
    { type: 'Wedding', interestRate: 14.5, description: 'Wedding and celebration loans' },
    { type: 'Travel', interestRate: 15.0, description: 'Travel and vacation loans' },
    { type: 'Gold', interestRate: 7.5, description: 'Gold secured loans with low rates' }
  ];

  constructor(
    private loanService: Loanservice, 
    private accountService: Accountservice,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchMyLoans();
    this.fetchMyAccounts();
  }

  fetchMyLoans() {
    this.loanService.getMyLoans().subscribe({
      next: (data) => {
        this.loans = data;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to fetch loans.';
      }
    });
  }

  fetchMyAccounts() {
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data.accounts || data;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to fetch accounts.';
      }
    });
  }

  showApplicationForm() {
    this.clearMessages();
    this.showLoanForm = true;
    this.resetLoanForm();
  }

  closeLoanForm() {
    this.showLoanForm = false;
    this.resetLoanForm();
  }

  resetLoanForm() {
    this.loanApplication = {
      loanType: 'Personal',
      amount: 0,
      tenureMonths: 0,
      interestRate: 8.5,
      accountId: ''
    };
  }

  onLoanTypeChange() {
    const selectedLoanType = this.loanTypes.find(type => type.type === this.loanApplication.loanType);
    if (selectedLoanType) {
      this.loanApplication.interestRate = selectedLoanType.interestRate;
    }
  }

  calculateEMI(): number {
    const { amount, tenureMonths, interestRate } = this.loanApplication;
    if (!amount || !tenureMonths || !interestRate) return 0;
    
    const monthlyRate = interestRate / (12 * 100);
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi);
  }

  submitLoanApplication() {
    // Validation
    if (!this.loanApplication.loanType) {
      this.errorMessage = 'Please select a loan type.';
      return;
    }
    if (!this.loanApplication.accountId) {
      this.errorMessage = 'Please select an account for the loan.';
      return;
    }
    if (!this.loanApplication.amount || this.loanApplication.amount <= 0) {
      this.errorMessage = 'Please enter a valid loan amount.';
      return;
    }
    if (!this.loanApplication.tenureMonths || this.loanApplication.tenureMonths <= 0) {
      this.errorMessage = 'Please enter a valid loan tenure.';
      return;
    }

    this.loanService.applyForLoan(this.loanApplication).subscribe({
      next: (response) => {
        this.successMessage = 'Loan application submitted successfully! Your application is under review.';
        this.closeLoanForm();
        this.fetchMyLoans(); // Refresh the loans list
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to submit loan application.';
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Closed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  withdrawLoan(loan: any) {
    const confirmWithdraw = confirm(
      `Are you sure you want to withdraw your ${loan.loanType} loan application for ₹${loan.amount}? This action cannot be undone.`
    );
    
    if (!confirmWithdraw) return;

    this.loanService.withdrawLoan(loan._id).subscribe({
      next: (response) => {
        this.successMessage = `${loan.loanType} loan application withdrawn successfully.`;
        this.fetchMyLoans(); // Refresh the loans list
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to withdraw loan application.';
      }
    });
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
