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
}

