import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Accountservice } from '../../service/accountservice';

@Component({
  selector: 'app-my-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-accounts.html',
  styleUrl: './my-accounts.css'
})
export class MyAccount implements OnInit {
  accounts: any[] = [];
  errorMessage = '';
  
  // Form state management
  activeOperation: { [key: string]: string } = {}; // accountId -> operation type
  operationAmounts: { [key: string]: number } = {}; // accountId -> amount
  transferToAccount: { [key: string]: string } = {}; // accountId -> target account id
  successMessage = '';
  
  // Add account form state
  showAddAccountModal = false;
  newAccount = {
    type: '',
    initialDeposit: 0
  };

  // Delete confirmation modal state
  showDeleteModal = false;
  accountToDelete: any = null;

  // Operation confirmation modals state
  showDepositModal = false;
  showWithdrawModal = false;
  showTransferModal = false;
  operationAccount: any = null;
  operationAmount: number = 0;
  transferDestinationAccount: any = null;

  constructor(private accountService: Accountservice, private router: Router) {}

  ngOnInit() {
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.errorMessage = '';
        this.successMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to fetch accounts.';
      }
    });
  }

  // Show deposit form
  showDepositForm(account: any) {
    const accountId = account._id || account.id;
    this.clearMessages();
    this.activeOperation[accountId] = 'deposit';
    this.operationAmounts[accountId] = 0;
  }

  // Show deposit modal (like delete modal)
  showDepositModal_New(account: any) {
    this.clearMessages();
    this.operationAccount = account;
    this.operationAmount = 0; // Will be set in modal
    this.showDepositModal = true;
  }

  // Show withdraw modal (like delete modal)
  showWithdrawModal_New(account: any) {
    this.clearMessages();
    this.operationAccount = account;
    this.operationAmount = 0; // Will be set in modal
    this.showWithdrawModal = true;
  }

  // Show transfer modal (like delete modal)
  showTransferModal_New(account: any) {
    this.clearMessages();
    this.operationAccount = account;
    this.operationAmount = 0; // Will be set in modal
    this.transferDestinationAccount = null; // Will be selected in modal
    this.showTransferModal = true;
  }

  // Process deposit - show confirmation modal
  processDeposit(account: any) {
    const accountId = account._id || account.id;
    const amount = this.operationAmounts[accountId];
    
    if (!amount || amount <= 0) {
      this.errorMessage = 'Please enter a valid deposit amount.';
      return;
    }

    this.clearMessages();
    this.operationAccount = account;
    this.operationAmount = amount;
    this.showDepositModal = true;
  }

  confirmDeposit() {
    const accountId = this.operationAccount._id || this.operationAccount.id;
    
    this.accountService.depositToAccount(accountId, this.operationAmount).subscribe({
      next: () => {
        this.successMessage = `Deposit of ₹${this.operationAmount} successful!`;
        this.cancelOperation(accountId);
        this.closeDepositModal();
        this.ngOnInit(); // Refresh accounts
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Deposit failed.';
        this.closeDepositModal();
      }
    });
  }

  closeDepositModal() {
    this.showDepositModal = false;
    this.operationAccount = null;
    this.operationAmount = 0;
  }

  // Show withdrawal form
  showWithdrawForm(account: any) {
    const accountId = account._id || account.id;
    this.clearMessages();
    this.activeOperation[accountId] = 'withdraw';
    this.operationAmounts[accountId] = 0;
  }

  // Process withdrawal - show confirmation modal
  processWithdraw(account: any) {
    const accountId = account._id || account.id;
    const amount = this.operationAmounts[accountId];
    
    if (!amount || amount <= 0) {
      this.errorMessage = 'Please enter a valid withdrawal amount.';
      return;
    }

    if (amount > account.balance) {
      this.errorMessage = 'Insufficient balance!';
      return;
    }

    this.clearMessages();
    this.operationAccount = account;
    this.operationAmount = amount;
    this.showWithdrawModal = true;
  }

  confirmWithdraw() {
    const accountId = this.operationAccount._id || this.operationAccount.id;
    
    this.accountService.withdrawFromAccount(accountId, this.operationAmount).subscribe({
      next: (response) => {
        this.successMessage = `Withdrawal of ₹${this.operationAmount} successful!`;
        this.cancelOperation(accountId);
        this.closeWithdrawModal();
        this.ngOnInit(); // Refresh accounts
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Withdrawal failed.';
        this.closeWithdrawModal();
      }
    });
  }

  closeWithdrawModal() {
    this.showWithdrawModal = false;
    this.operationAccount = null;
    this.operationAmount = 0;
  }

  // Show transfer form
  showTransferForm(account: any) {
    const accountId = account._id || account.id;
    const otherAccounts = this.accounts.filter(acc => (acc._id || acc.id) !== accountId);
    
    if (otherAccounts.length === 0) {
      this.errorMessage = 'You need at least 2 accounts to make a transfer. Please create another account first.';
      return;
    }

    this.clearMessages();
    this.activeOperation[accountId] = 'transfer';
    this.operationAmounts[accountId] = 0;
    this.transferToAccount[accountId] = '';
  }

  // Process transfer - show confirmation modal
  processTransfer(account: any) {
    const accountId = account._id || account.id;
    const amount = this.operationAmounts[accountId];
    const toAccountId = this.transferToAccount[accountId];
    
    if (!amount || amount <= 0) {
      this.errorMessage = 'Please enter a valid transfer amount.';
      return;
    }

    if (!toAccountId) {
      this.errorMessage = 'Please select a destination account.';
      return;
    }

    if (amount > account.balance) {
      this.errorMessage = 'Insufficient balance!';
      return;
    }

    const toAccount = this.accounts.find(acc => (acc._id || acc.id) === toAccountId);
    
    this.clearMessages();
    this.operationAccount = account;
    this.operationAmount = amount;
    this.transferDestinationAccount = toAccount;
    this.showTransferModal = true;
  }

  confirmTransfer() {
    const accountId = this.operationAccount._id || this.operationAccount.id;
    const toAccountId = this.transferDestinationAccount._id || this.transferDestinationAccount.id;
    
    this.accountService.transferFunds(accountId, toAccountId, this.operationAmount).subscribe({
      next: (response) => {
        this.successMessage = `Transfer of ₹${this.operationAmount} successful from ${this.operationAccount.type} Account to ${this.transferDestinationAccount.type} Account!`;
        this.cancelOperation(accountId);
        this.closeTransferModal();
        this.ngOnInit(); // Refresh accounts
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Transfer failed.';
        this.closeTransferModal();
      }
    });
  }

  closeTransferModal() {
    this.showTransferModal = false;
    this.operationAccount = null;
    this.operationAmount = 0;
    this.transferDestinationAccount = null;
  }

  // Get other accounts for transfer
  getOtherAccounts(currentAccountId: string) {
    return this.accounts.filter(acc => (acc._id || acc.id) !== currentAccountId);
  }

  // Helper methods
  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelOperation(accountId: string) {
    delete this.activeOperation[accountId];
    delete this.operationAmounts[accountId];
    delete this.transferToAccount[accountId];
  }

  isOperationActive(accountId: string, operation: string): boolean {
    return this.activeOperation[accountId] === operation;
  }

  // Add Account methods
  showAddAccountForm() {
    this.clearMessages();
    this.showAddAccountModal = true;
    this.newAccount = {
      type: '',
      initialDeposit: 0
    };
  }

  closeAddAccountForm() {
    this.showAddAccountModal = false;
    this.newAccount = {
      type: '',
      initialDeposit: 0
    };
  }

  createAccount() {
    if (!this.newAccount.type) {
      this.errorMessage = 'Please select an account type.';
      return;
    }

    this.accountService.createAccount(this.newAccount.type).subscribe({
      next: (response) => {
        // If there's an initial deposit, make a deposit after account creation
        if (this.newAccount.initialDeposit > 0) {
          this.accountService.depositToAccount(response._id || response.id, this.newAccount.initialDeposit).subscribe({
            next: () => {
              this.successMessage = `${this.newAccount.type} account created successfully with initial deposit of ₹${this.newAccount.initialDeposit}!`;
              this.closeAddAccountForm();
              this.ngOnInit(); // Refresh accounts
            },
            error: (err) => {
              this.errorMessage = err.error?.error || 'Account created but initial deposit failed.';
            }
          });
        } else {
          this.successMessage = `${this.newAccount.type} account created successfully!`;
          this.closeAddAccountForm();
          this.ngOnInit(); // Refresh accounts
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to create account.';
      }
    });
  }

  deleteAccount(account: any) {
    this.clearMessages();
    this.accountToDelete = account;
    this.showDeleteModal = true;
  }

  confirmDeleteAccount() {
    if (this.accountToDelete) {
      this.accountService.deleteAccount(this.accountToDelete._id || this.accountToDelete.id).subscribe({
        next: (response) => {
          this.successMessage = 'Account deleted successfully!';
          this.showDeleteModal = false;
          this.accountToDelete = null;
          this.ngOnInit(); // Refresh accounts
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Failed to delete account.';
          this.showDeleteModal = false;
          this.accountToDelete = null;
        }
      });
    }
  }

  cancelDeleteAccount() {
    this.showDeleteModal = false;
    this.accountToDelete = null;
  }

  // Navigate back to dashboard
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
