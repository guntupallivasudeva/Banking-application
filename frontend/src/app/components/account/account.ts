import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Accountservice } from '../../service/accountservice';

@Component({
  selector: 'app-account',
  imports: [CommonModule, FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account {
    accounts: any[] = [];
  type: string = '';
  errorMessage = '';
  successMessage = '';
  showDeposit = false;
  depositAmount = 0;
  lastCreatedAccountId: string | null = null;

  constructor(private accountService: Accountservice, private router: Router) {}

  ngOnInit() {
    this.fetchAccounts();
  }

  fetchAccounts() {
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to fetch accounts.';
      }
    });
  }

  createAccount() {
    if (!this.type) return;
    this.accountService.createAccount(this.type).subscribe({
      next: (data) => {
        this.successMessage = 'Account created!';
        this.errorMessage = '';
        this.type = '';
        this.lastCreatedAccountId = data._id || data.id || null;
        this.showDeposit = true;
        this.fetchAccounts();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to create account.';
        this.successMessage = '';
      }
    });
  }

  goBack() {
    window.history.back();
  }

  deposit() {
    if (!this.lastCreatedAccountId || !this.depositAmount || this.depositAmount <= 0) return;
    this.accountService.depositToAccount(this.lastCreatedAccountId, this.depositAmount).subscribe({
      next: () => {
        this.successMessage = 'Deposit successful!';
        this.errorMessage = '';
        this.showDeposit = false;
        this.depositAmount = 0;
        this.fetchAccounts();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Deposit failed.';
        this.successMessage = '';
      }
    });
  }
}
