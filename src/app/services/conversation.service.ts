import { Injectable } from '@angular/core';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private readonly STORAGE_KEY = 'symptom-sense-conversations';
  private readonly CURRENT_CONV_KEY = 'symptom-sense-current-conversation';

  constructor() {}

  // Get all conversations
  getAllConversations(): Conversation[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    const conversations = JSON.parse(stored) as Conversation[];
    // Convert date strings back to Date objects
    return conversations.map(conv => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
    }));
  }

  // Get a specific conversation by ID
  getConversation(id: string): Conversation | null {
    const conversations = this.getAllConversations();
    return conversations.find(conv => conv.id === id) || null;
  }

  // Create a new conversation
  createConversation(model: string): Conversation {
    const newConversation: Conversation = {
      id: this.generateId(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model,
    };
    
    const conversations = this.getAllConversations();
    conversations.unshift(newConversation); // Add to beginning
    this.saveConversations(conversations);
    this.setCurrentConversationId(newConversation.id);
    
    return newConversation;
  }

  // Update a conversation
  updateConversation(id: string, messages: Message[], model?: string): void {
    const conversations = this.getAllConversations();
    const index = conversations.findIndex(conv => conv.id === id);
    
    if (index !== -1) {
      conversations[index].messages = messages;
      conversations[index].updatedAt = new Date();
      
      if (model) {
        conversations[index].model = model;
      }
      
      // Update title if this is the first user message
      if (messages.length > 0 && conversations[index].title === 'New Conversation') {
        const firstUserMessage = messages.find(m => m.type === 'user');
        if (firstUserMessage) {
          conversations[index].title = this.generateTitle(firstUserMessage.content);
        }
      }
      
      this.saveConversations(conversations);
    }
  }

  // Delete a conversation
  deleteConversation(id: string): void {
    const conversations = this.getAllConversations();
    const filtered = conversations.filter(conv => conv.id !== id);
    this.saveConversations(filtered);
    
    // If we deleted the current conversation, clear it
    if (this.getCurrentConversationId() === id) {
      this.clearCurrentConversationId();
    }
  }

  // Rename a conversation
  renameConversation(id: string, newTitle: string): void {
    const conversations = this.getAllConversations();
    const index = conversations.findIndex(conv => conv.id === id);
    
    if (index !== -1) {
      conversations[index].title = newTitle;
      conversations[index].updatedAt = new Date();
      this.saveConversations(conversations);
    }
  }

  // Get current conversation ID
  getCurrentConversationId(): string | null {
    return localStorage.getItem(this.CURRENT_CONV_KEY);
  }

  // Set current conversation ID
  setCurrentConversationId(id: string): void {
    localStorage.setItem(this.CURRENT_CONV_KEY, id);
  }

  // Clear current conversation ID
  clearCurrentConversationId(): void {
    localStorage.removeItem(this.CURRENT_CONV_KEY);
  }

  // Private helper methods
  private saveConversations(conversations: Conversation[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
  }

  private generateId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTitle(content: string): string {
    // Take first 50 characters and trim
    const title = content.substring(0, 50).trim();
    return title.length < content.length ? `${title}...` : title;
  }
}

