import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoanApplicationRequest, UserLoan, SimpleLoanApplication } from '../models/loan-application.interface';

declare const API_KEY: string | undefined;
const API_ROOT = (() => {
  try {
    const g: any = (globalThis as any);
    if (g && typeof g.API_KEY === 'string' && g.API_KEY.length) return g.API_KEY;
    if (typeof API_KEY !== 'undefined' && API_KEY) return API_KEY;
  } catch (_) { /* ignore */ }
  return 'http://localhost:8000/api';
})();
const NORMALIZED_API_ROOT = API_ROOT.replace(/\/$/, '');

@Injectable({
  providedIn: 'root'
})
export class Loanservice {
  private apiUrl = `${NORMALIZED_API_ROOT}/loans`;

  constructor(private http: HttpClient) {}

  // Apply for a new loan (simple version)
  applyForLoan(loanData: SimpleLoanApplication): Observable<{ message: string; loan: UserLoan }>;
  // Apply for a new loan (detailed version)
  applyForLoan(loanData: LoanApplicationRequest): Observable<{ message: string; loan: UserLoan }>;
  // Implementation
  applyForLoan(loanData: SimpleLoanApplication | LoanApplicationRequest): Observable<{ message: string; loan: UserLoan }> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ message: string; loan: UserLoan }>(`${this.apiUrl}/apply`, loanData, { headers });
  }

  // Get all loans for the authenticated user
  getMyLoans(): Observable<UserLoan[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserLoan[]>(`${this.apiUrl}/myloans`, { headers });
  }

  // Get details of a specific loan
  getLoanDetails(loanId: string): Observable<UserLoan> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserLoan>(`${this.apiUrl}/${loanId}`, { headers });
  }

  // Get repayment schedule for a loan
  getRepaymentSchedule(loanId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/${loanId}/repayments`, { headers });
  }

  // Make a payment on a loan installment
  payLoanInstallment(loanId: string, paymentAmount: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/${loanId}/pay`, { paymentAmount }, { headers });
  }

  // Withdraw/cancel a loan application (only for pending loans)
  withdrawLoan(loanId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${loanId}/withdrawloan`, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }
}