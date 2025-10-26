import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatResponse } from '../models/chat-response.model';
import { AI_MODELS } from '../constants/app.constants';

type AIProvider = 'MISTRAL' | 'GEMINI' | 'ASHISH';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private currentProvider: AIProvider = 'MISTRAL';

  constructor(private http: HttpClient) {}

  setProvider(provider: AIProvider): void {
    this.currentProvider = provider;
  }

  getCurrentProvider(): string {
    return AI_MODELS[this.currentProvider].name;
  }

  sendMessage(message: string, image: string | null, sessionId: string): Observable<ChatResponse> {
    switch (this.currentProvider) {
      case 'MISTRAL':
        return this.sendToMistral(message);
      case 'GEMINI':
        return this.sendToGemini(message);
      case 'ASHISH':
        return this.sendToAshish(message);
      default:
        return this.sendToMistral(message);
    }
  }

  private sendToMistral(message: string): Observable<ChatResponse> {
    const config = AI_MODELS.MISTRAL;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    });

    const body = {
      model: config.model,
      messages: [{ role: 'user', content: message }]
    };

    return this.http.post<any>(config.apiUrl, body, { headers }).pipe(
      map(response => ({
        response: response.choices[0].message.content,
        status: 'success'
      }))
    );
  }

  private sendToGemini(message: string): Observable<ChatResponse> {
    const config = AI_MODELS.GEMINI;
    const url = `${config.apiUrl}?key=${config.apiKey}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      contents: [{
        parts: [{ text: message }]
      }]
    };

    return this.http.post<any>(url, body, { headers }).pipe(
      map(response => ({
        response: response.candidates[0].content.parts[0].text,
        status: 'success'
      }))
    );
  }

  private sendToAshish(message: string): Observable<ChatResponse> {
    const config = AI_MODELS.ASHISH;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    });

    const body = {
      model: config.model,
      messages: [{ role: 'user', content: message }]
    };

    return this.http.post<any>(config.apiUrl, body, { headers }).pipe(
      map(response => ({
        response: response.choices?.[0]?.message?.content || response.response || 'No response',
        status: 'success'
      }))
    );
  }
}

