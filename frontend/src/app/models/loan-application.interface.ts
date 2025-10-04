export interface LoanApplication {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt?: Date;
  };
  accountId?: {
    _id: string;
    accountNumber: string;
    type: string;
    balance: number;
    createdAt?: Date;
  };
  loanType: 'Personal' | 'Home' | 'Education' | 'Auto' | 'Business' | 'Medical' | 'Wedding' | 'Travel' | 'Gold';
  amount: number;
  tenureMonths: number;
  interestRate: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
  // Admin-added fields for loan approval/rejection
  term?: number;
  monthlyPayment?: number;
  approvedDate?: Date;
  approvedBy?: string;
  declinedDate?: Date;
  declinedBy?: string;
  declineReason?: string;
}

export interface LoanApplicationRequest {
  loanType: 'Personal' | 'Home' | 'Education' | 'Auto' | 'Business' | 'Medical' | 'Wedding' | 'Travel' | 'Gold';
  amount: number;
  tenureMonths: number;
  interestRate: number;
  accountId?: string;
}

export interface UserLoan {
  _id: string;
  userId: string;
  loanType: 'Personal' | 'Home' | 'Education' | 'Auto' | 'Business' | 'Medical' | 'Wedding' | 'Travel' | 'Gold';
  amount: number;
  tenureMonths: number;
  interestRate: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
  // Additional computed/optional fields
  term?: number;
  monthlyPayment?: number;
}

export interface SimpleLoanApplication {
  loanType: 'Personal' | 'Home' | 'Education' | 'Auto' | 'Business' | 'Medical' | 'Wedding' | 'Travel' | 'Gold';
  amount: number;
  tenureMonths: number;
  interestRate: number;
  accountId?: string;
}

export interface AdminLoanResponse {
  loans: LoanApplication[];
  count: number;
}

export interface Repayment {
  _id: string;
  loanId: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  paymentAmount: number;
}

export interface PaymentResponse {
  message: string;
  account: any;
  repayment: Repayment;
  loanClosed?: boolean;
}