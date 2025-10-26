import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationService } from '../../services/conversation.service';
import { Conversation } from '../../models/conversation.model';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.css',
})
export class ChatSidebarComponent implements OnInit {
  @Output() conversationSelected = new EventEmitter<string>();
  @Output() newConversation = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() deleteConversation = new EventEmitter<string>();

  conversations: Conversation[] = [];
  currentConversationId: string | null = null;
  editingConversationId: string | null = null;
  editingTitle: string = '';
  isClosing: boolean = false;

  constructor(private conversationService: ConversationService) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.conversations = this.conversationService.getAllConversations();
    this.currentConversationId = this.conversationService.getCurrentConversationId();
  }

  selectConversation(id: string): void {
    this.conversationSelected.emit(id);
  }

  onNewConversation(): void {
    this.newConversation.emit();
  }

  onDeleteConversation(event: Event, id: string): void {
    event.stopPropagation();
    this.deleteConversation.emit(id);
  }

  close(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.closeSidebar.emit();
      this.isClosing = false;
    }, 300); // Match animation duration
  }

  isCurrentConversation(id: string): boolean {
    return this.currentConversationId === id;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  }

  onContextMenu(event: MouseEvent, conversation: Conversation): void {
    event.preventDefault();
    this.startEditing(conversation.id, conversation.title);
  }

  startEditing(id: string, title: string): void {
    this.editingConversationId = id;
    this.editingTitle = title;
  }

  saveRename(id: string): void {
    if (this.editingTitle.trim()) {
      this.conversationService.renameConversation(id, this.editingTitle.trim());
      this.loadConversations();
    }
    this.cancelEditing();
  }

  cancelEditing(): void {
    this.editingConversationId = null;
    this.editingTitle = '';
  }

  onRenameKeydown(event: KeyboardEvent, id: string): void {
    if (event.key === 'Enter') {
      this.saveRename(id);
    } else if (event.key === 'Escape') {
      this.cancelEditing();
    }
  }
}

