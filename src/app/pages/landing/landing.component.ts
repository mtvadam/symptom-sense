import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { APP_CONSTANTS, MEDICAL_DISCLAIMER, PRIVACY_NOTICE } from '../../constants/app.constants';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  readonly appName = APP_CONSTANTS.APP_NAME;
  readonly tagline = APP_CONSTANTS.TAGLINE;
  readonly medicalDisclaimer = MEDICAL_DISCLAIMER;
  readonly privacyNotice = PRIVACY_NOTICE;

  constructor(private router: Router) {}

  startConsultation(): void {
    this.router.navigate(['/chat']);
  }

  scrollToConsent(): void {
    const consentSection = document.getElementById('consent');
    if (consentSection) {
      consentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  goToBeta(): void {
    this.router.navigate(['/beta']);
  }

  goToHome(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }
}

