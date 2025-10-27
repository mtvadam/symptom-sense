import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ElevenLabsService {
  private apiKey: string = 'sk_4c2bd74585839bb4fce1e081110244091f0478b9eac2a201'; // Add your ElevenLabs API key here
  private voiceId: string = 'IKne3meq5aSn9XLyUdCD'; // Charlie voice
  private apiUrl: string = 'https://api.elevenlabs.io/v1';

  constructor() {
    // Try to load API key from localStorage
    const storedKey = localStorage.getItem('elevenlabs_api_key');
    if (storedKey) {
      this.apiKey = storedKey;
      console.log('✅ ElevenLabs API key loaded successfully');
    } else {
      console.warn(
        '⚠️ ElevenLabs API key not found!\n\n' +
        'To enable realistic AI voice:\n' +
        '1. Sign up at https://elevenlabs.io/ (free tier available)\n' +
        '2. Get your API key from profile settings\n' +
        '3. Run this command in console:\n' +
        '   localStorage.setItem("elevenlabs_api_key", "YOUR_API_KEY");\n' +
        '4. Refresh the page\n\n' +
        'See ELEVENLABS_SETUP.md for detailed instructions.'
      );
    }
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem('elevenlabs_api_key', key);
  }

  getApiKey(): string {
    return this.apiKey;
  }

  setVoiceId(voiceId: string): void {
    this.voiceId = voiceId;
  }

  /**
   * Clean text by removing markdown symbols, asterisks, and other formatting
   */
  private cleanText(text: string): string {
    return text
      // Remove markdown bold (**text** or __text__)
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      // Remove markdown italic (*text* or _text_)
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      // Remove markdown headers (# ## ###)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown links [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove code blocks ```
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code `
      .replace(/`([^`]+)`/g, '$1')
      // Remove HTML tags
      .replace(/<[^>]+>/g, '')
      // Remove extra asterisks
      .replace(/\*/g, '')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Convert text to speech using ElevenLabs API
   * @param text The text to convert to speech
   * @returns Observable with audio blob URL
   */
  textToSpeech(text: string): Observable<string> {
    if (!this.apiKey) {
      return throwError(() => new Error('ElevenLabs API key not set. Please add your API key in settings.'));
    }

    if (!text || text.trim().length === 0) {
      return throwError(() => new Error('Text cannot be empty'));
    }

    // Clean the text before sending to API
    const cleanedText = this.cleanText(text);

    const url = `${this.apiUrl}/text-to-speech/${this.voiceId}`;
    
    const requestBody = {
      text: cleanedText, // Use cleaned text instead of raw text
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    };

    const promise = fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your ElevenLabs API key.');
        } else if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }
      }
      return response.blob();
    })
    .then(blob => {
      // Create a URL for the audio blob
      const audioUrl = URL.createObjectURL(blob);
      return audioUrl;
    });

    return from(promise).pipe(
      catchError(error => {
        console.error('ElevenLabs API error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get available voices from ElevenLabs
   */
  getVoices(): Observable<any[]> {
    if (!this.apiKey) {
      return throwError(() => new Error('ElevenLabs API key not set'));
    }

    const url = `${this.apiUrl}/voices`;
    
    const promise = fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }
      return response.json();
    })
    .then(data => data.voices || []);

    return from(promise).pipe(
      catchError(error => {
        console.error('Failed to fetch voices:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Clean up blob URL to prevent memory leaks
   */
  revokeBlobUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}

