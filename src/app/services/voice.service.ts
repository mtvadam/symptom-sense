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
      this.recognition.continuous = true; // Keep listening continuously
      this.recognition.interimResults = true; // Get real-time interim results
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      let finalTranscript = '';

      this.recognition.onstart = () => {
        console.log('Voice recognition started');
        this.isRecognitionActive = true;
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            // Final result - add to final transcript
            finalTranscript += transcript + ' ';
            console.log('Final transcript:', transcript);
          } else {
            // Interim result - add to interim transcript
            interimTranscript += transcript;
            console.log('Interim transcript:', transcript);
          }
        }

        // Emit the combined transcript (final + interim)
        const currentTranscript = (finalTranscript + interimTranscript).trim();
        if (currentTranscript) {
          observer.next(currentTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Voice recognition error event:', event.error);
        this.isRecognitionActive = false;
        // Ignore 'no-speech' and 'aborted' errors as they're normal when stopping
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          observer.error(event.error || 'Voice recognition error');
        } else {
          observer.complete();
        }
      };

      this.recognition.onend = () => {
        console.log('Voice recognition ended');
        this.isRecognitionActive = false;
        observer.complete();
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

