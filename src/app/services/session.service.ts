import { Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private sessionId: string | null = null;
  private timeoutId: any = null;

  generateSessionId(): string {
    // Generate a simple UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
      this.startSessionTimer();
    }
    return this.sessionId;
  }

  startSessionTimer(): void {
    this.clearSessionTimer();
    const timeoutMs = APP_CONSTANTS.SESSION_TIMEOUT_MINUTES * 60 * 1000;
    this.timeoutId = setTimeout(() => {
      this.clearSession();
    }, timeoutMs);
  }

  clearSessionTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  clearSession(): void {
    this.sessionId = null;
    this.clearSessionTimer();
  }

  resetTimer(): void {
    if (this.sessionId) {
      this.startSessionTimer();
    }
  }
}

