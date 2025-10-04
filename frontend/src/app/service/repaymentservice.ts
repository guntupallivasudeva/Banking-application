import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repayment, PaymentRequest, PaymentResponse, LoanApplication } from '../models/loan-application.interface';

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
export class RepaymentService {
  private apiUrl = `${NORMALIZED_API_ROOT}/loans`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Get user's loans
  getMyLoans(): Observable<LoanApplication[]> {
    console.log('Fetching user loans');
    console.log('Request URL:', `${this.apiUrl}/myloans`);
    
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/myloans`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get repayment schedule for a specific loan
  getRepaymentSchedule(loanId: string): Observable<Repayment[]> {
    console.log('Fetching repayments for loan ID:', loanId);
    console.log('Request URL:', `${this.apiUrl}/${loanId}/repayments`);
    console.log('Auth headers:', this.getAuthHeaders());
    
    return this.http.get<Repayment[]>(`${this.apiUrl}/${loanId}/repayments`, {
      headers: this.getAuthHeaders()
    });
  }

  // Make a payment for a loan installment
  makePayment(loanId: string, paymentData: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/${loanId}/pay`, paymentData, {
      headers: this.getAuthHeaders()
    });
  }
}