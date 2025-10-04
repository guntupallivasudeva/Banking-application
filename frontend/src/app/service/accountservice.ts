import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  export class Accountservice {
  private apiUrl = `${NORMALIZED_API_ROOT}/accounts`;

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(this.apiUrl, { headers });
  }

  createAccount(type: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(this.apiUrl, { type }, { headers });
  }

  depositToAccount(accountId: string, amount: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/${accountId}/deposit`, { amount }, { headers });
  }

  withdrawFromAccount(accountId: string, amount: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/${accountId}/withdraw`, { amount }, { headers });
  }

  transferFunds(fromAccountId: string, toAccountId: string, amount: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/transfer`, { fromAccountId, toAccountId, amount }, { headers });
  }

  deleteAccount(accountId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${accountId}`, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }
}