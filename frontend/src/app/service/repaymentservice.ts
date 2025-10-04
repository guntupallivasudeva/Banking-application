import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repayment, PaymentRequest, PaymentResponse, LoanApplication } from '../models/loan-application.interface';

@Injectable({
  providedIn: 'root'
})
export class RepaymentService {
  private apiUrl = 'http://localhost:8000/api/loans';

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