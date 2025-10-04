import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanApplication, AdminLoanResponse } from '../models/loan-application.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminLoanService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get all loan applications for admin review
  getAllLoans(): Observable<AdminLoanResponse> {
    return this.http.get<AdminLoanResponse>(`${this.baseUrl}/admin/loans`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Approve a loan application
  approveLoan(loanId: string, approvalData: {
    interestRate: number;
    term: number;
    monthlyPayment: number;
    approvedDate: Date;
  }): Observable<{ message: string; loan: LoanApplication }> {
    return this.http.put<{ message: string; loan: LoanApplication }>(
      `${this.baseUrl}/admin/loans/${loanId}/approve`, 
      approvalData, 
      { headers: this.getAuthHeaders() }
    );
  }

  // Decline a loan application
  declineLoan(loanId: string, declineReason: string): Observable<{ message: string; loan: LoanApplication }> {
    return this.http.put<{ message: string; loan: LoanApplication }>(
      `${this.baseUrl}/admin/loans/${loanId}/decline`, 
      { reason: declineReason }, 
      { headers: this.getAuthHeaders() }
    );
  }

  // Get loan details with account information
  getLoanWithAccountDetails(loanId: string): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(`${this.baseUrl}/admin/loans/${loanId}/details`, { 
      headers: this.getAuthHeaders() 
    });
  }



  // Get all loan accounts with repayments for admin view
  getAllRepayments(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/repayments`, { 
      headers: this.getAuthHeaders() 
    });
  }
}