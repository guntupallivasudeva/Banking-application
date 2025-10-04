// ...existing code...
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Authservice } from '../../service/authservice';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-signup',
  imports: [FormsModule, CommonModule,RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  agreedToTerms: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  name = '';
  email = '';
  password = '';

  constructor(private authService: Authservice,
    private router: Router
  ) { }

  async onSubmit() {
    try {
      const result: any = await this.authService.signup(this.name, this.email, this.password);
      // REST signup returns a created user object (id, name, email) on success
      if (result && (result.id || result._id || (result.email && result.name))) {
        this.successMessage = 'Signup successful! Please login.';
        this.errorMessage = '';
        this.router.navigate(['/login']);
      } else {
        this.errorMessage = 'Signup failed. Please try again.';
        this.successMessage = '';
      }
    } catch (error: any) {
      this.errorMessage = error?.error?.error || error?.message || 'Signup failed. Please try again.';
      this.successMessage = '';
    }
  }
}
