import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Authservice } from '../../service/authservice';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  successMessage = '';
  errorMessage = '';

  constructor(private authService: Authservice, private router: Router) {}

  onSubmit() {
    this.doLogin();
  }

  async doLogin() {
    try {
      const result: any = await this.authService.login(this.email, this.password);
      // REST login returns { token, user }
      if (result && result.token) {
        const { token, user } = result;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.successMessage = 'Login successful!';
        this.errorMessage = '';

        if (user.role === 'admin') {
          localStorage.setItem('isAdmin', 'true');
          localStorage.setItem('adminUser', JSON.stringify(user));
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.errorMessage = 'Login failed. Please try again.';
        this.successMessage = '';
      }
    } catch (error: any) {
      this.errorMessage = error?.error?.error || error?.message || 'Login failed. Please try again.';
      this.successMessage = '';
    }
  }
}
