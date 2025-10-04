import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { Account } from './components/account/account';
import { Dashboard } from './components/dashboard/dashboard';
import { MyAccount } from './components/my-accounts/my-accounts';
import { Routes } from '@angular/router';
import { Loans } from './components/loans/loans';
import { Main } from './components/main/main';
import { AdminLoans } from './components/admin-loans/admin-loans';
import { AdminLogin } from './components/admin-login/admin-login';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Repayments } from './components/repayments/repayments';
import { AdminRepayments } from './components/admin-repayments/admin-repayments';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes= [
    { path: '', redirectTo: 'main', pathMatch: 'full'},
    { path: 'main', component: Main },
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
    { path: 'dashboard', component: Dashboard },
    { path: 'open-account', component: Account },
    { path: 'my-accounts', component: MyAccount },
    { path: 'apply-loans', component: Loans },
    { path: 'loans', component: Loans },
    { path: 'admin-login', component: AdminLogin },
    { path: 'admin-dashboard', component: AdminDashboard, canActivate: [AdminGuard] },
    { path: 'admin-loans', component: AdminLoans, canActivate: [AdminGuard] },
    { path: 'admin-repayments', component: AdminRepayments, canActivate: [AdminGuard] },
    { path: 'repayments', component: Repayments },
    { path: '**', redirectTo: 'main', pathMatch: 'full' }
];
