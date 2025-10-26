import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class VoiceService {
  private recognition: any = null;
  private isRecognitionActive = false;

  isBrowserSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  startRecording(): Observable<string> {
    return new Observable((observer) => {
      if (!this.isBrowserSupported()) {
        observer.error('Speech recognition not supported');
        return;
      }

      if (this.isRecognitionActive) {
        observer.error('Recognition already active');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        console.log('Voice recognition started');
        this.isRecognitionActive = true;
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice transcript captured:', transcript);
        observer.next(transcript);
        observer.complete();
      };

      this.recognition.onerror = (event: any) => {
        console.error('Voice recognition error event:', event.error);
        this.isRecognitionActive = false;
        observer.error(event.error || 'Voice recognition error');
      };

      this.recognition.onend = () => {
        console.log('Voice recognition ended');
        this.isRecognitionActive = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isRecognitionActive = false;
        observer.error('Failed to start voice recognition');
      }
    });
  }

  stopRecording(): void {
    if (this.recognition && this.isRecognitionActive) {
      try {
        this.recognition.stop();
        this.isRecognitionActive = false;
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }
}

