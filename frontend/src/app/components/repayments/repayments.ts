import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RepaymentService } from '../../service/repaymentservice';
import { LoanApplication, Repayment } from '../../models/loan-application.interface';

@Component({
  selector: 'app-repayments',
  imports: [CommonModule],
  templateUrl: './repayments.html',
  styleUrl: './repayments.css'
})
export class Repayments implements OnInit {
  loans: LoanApplication[] = [];
  selectedLoan: LoanApplication | null = null;
  repayments: Repayment[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  paymentLoading = false;

  constructor(
    private repaymentService: RepaymentService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadUserLoans();
  }



  loadUserLoans() {
    this.loading = true;
    this.errorMessage = '';
    this.repaymentService.getMyLoans().subscribe({
      next: (loans) => {
        this.loans = loans;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load loans';
        this.loading = false;
      }
    });
  }

  selectLoan(loan: LoanApplication) {
    this.selectedLoan = loan;
    this.loadRepaymentSchedule(loan._id);
  }

  loadRepaymentSchedule(loanId: string) {
    this.loading = true;
    this.errorMessage = '';
    this.repaymentService.getRepaymentSchedule(loanId).subscribe({
      next: (repayments) => {
        this.repayments = repayments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load repayment schedule';
        this.loading = false;
      }
    });
  }

  makePayment(repayment: Repayment) {
    if (!this.selectedLoan || this.paymentLoading) return;

    this.paymentLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const paymentData = {
      paymentAmount: repayment.amount
    };

    this.repaymentService.makePayment(this.selectedLoan._id, paymentData).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.paymentLoading = false;

        // Reload repayment schedule to reflect the payment
        this.loadRepaymentSchedule(this.selectedLoan!._id);
        
        // Reload the loans to get updated data
        this.loadUserLoans();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Payment failed';
        this.paymentLoading = false;
      }
    });
  }

  getNextUnpaidInstallment(): Repayment | null {
    return this.repayments.find(r => !r.paid) || null;
  }

  goBack() {
    this.location.back();
  }

  goToLoans() {
    this.router.navigate(['/loans']);
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
