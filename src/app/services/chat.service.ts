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
        return this.sendToMistral(message, image);
      case 'GEMINI':
        return this.sendToGemini(message);
      case 'ASHISH':
        return this.sendToAshish(message);
      default:
        return this.sendToMistral(message, image);
    }
  }

  private sendToMistral(message: string, image: string | null = null): Observable<ChatResponse> {
    const config = AI_MODELS.MISTRAL;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    });

    // System prompt for medical analysis
    const systemMessage = {
      role: 'system',
      content: 'You are a medical diagnostic assistant. Analyze symptoms carefully and provide helpful, accurate information. When analyzing images, describe visible symptoms, potential conditions, and recommend appropriate medical consultation. Always remind users to seek professional medical advice for accurate diagnosis.'
    };

    // Build message content - if image exists, use multimodal format
    let messageContent: any;
    
    if (image) {
      // Multimodal format with text and image
      messageContent = [
        {
          type: 'text',
          text: message || 'Please analyze this image and describe what you see, focusing on any medical symptoms or concerns.'
        },
        {
          type: 'image_url',
          image_url: image // Base64 image string
        }
      ];
    } else {
      // Text-only format
      messageContent = message;
    }

    const body = {
      model: config.model,
      messages: [
        systemMessage,
        { role: 'user', content: messageContent }
      ]
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

