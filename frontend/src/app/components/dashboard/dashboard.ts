import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  userName: string = '';
  currentTime: Date = new Date();
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
  timeZoneShort: string = '';
  private timeIntervalId: any;

  constructor(private router: Router) {}

  ngOnInit() {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name) {
          this.userName = parsed.name;
        }
      }
    } catch (_) {
      this.userName = '';
    }

    // Start live clock (updates every second)
    this.timeIntervalId = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    // Derive a short timezone label (best-effort)
    try {
      const parts = new Date().toLocaleTimeString(undefined, { timeZoneName: 'short' }).split(' ');
      this.timeZoneShort = parts[parts.length - 1];
      if (!/^[A-Z+-]/i.test(this.timeZoneShort)) {
        this.timeZoneShort = this.timeZone; // fallback
      }
    } catch (_) {
      this.timeZoneShort = this.timeZone;
    }
  }

  ngOnDestroy() {
    if (this.timeIntervalId) {
      clearInterval(this.timeIntervalId);
    }
  }

  logout() {
    // Clear authentication state
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUser');
    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
