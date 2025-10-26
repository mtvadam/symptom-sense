import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-beta-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './beta-signup.component.html',
  styleUrl: './beta-signup.component.css',
})
export class BetaSignupComponent {
  email = '';
  name = '';
  isSubmitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router) {}

  onSubmit(): void {
    // Basic validation
    if (!this.email || !this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (!this.name || this.name.trim().length < 2) {
      this.errorMessage = 'Please enter your name';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      // Store in localStorage for now (not sent anywhere)
      const signups = JSON.parse(localStorage.getItem('betaSignups') || '[]');
      signups.push({
        email: this.email,
        name: this.name,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('betaSignups', JSON.stringify(signups));

      this.isLoading = false;
      this.isSubmitted = true;

      // Reset form
      this.email = '';
      this.name = '';
    }, 1000);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToChat(): void {
    this.router.navigate(['/chat']);
  }
}

