import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageComponent } from '../../components/message/message.component';
import { LoadingComponent } from '../../components/loading/loading.component';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';
import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { ChatService } from '../../services/chat.service';
import { VoiceService } from '../../services/voice.service';
import { SessionService } from '../../services/session.service';
import { ConversationService } from '../../services/conversation.service';
import { Message } from '../../models/message.model';
import { Conversation } from '../../models/conversation.model';
import { APP_CONSTANTS, ERROR_MESSAGES } from '../../constants/app.constants';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageComponent, LoadingComponent, ErrorMessageComponent, ChatSidebarComponent, ConfirmModalComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef;
  @ViewChild('sidebar') private sidebarComponent: any;

  messages: Message[] = [];
  inputMessage: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;
  selectedImage: string | null = null;
  imagePreviewUrl: string | null = null;
  isRecording: boolean = false;
  isVoiceSupported: boolean = false;
  selectedModel: 'MISTRAL' | 'GEMINI' | 'ASHISH' = 'GEMINI';
  showSidebar: boolean = false;
  currentWelcomeMessage: string = '';
  showDeleteModal: boolean = false;
  conversationToDelete: string | null = null;

  private sessionId: string = '';
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom: boolean = false;
  private errorTimeoutId: any = null;
  private currentConversationId: string | null = null;

  private readonly welcomeMessages = [
    {
      main: "Welcome! How can I assist you today?",
      sub: "Describe your symptoms and I'll help you understand them better."
    },
    {
      main: "Hello! I'm here to help.",
      sub: "Tell me about any symptoms you're experiencing."
    },
    {
      main: "Hi there! Ready to assist.",
      sub: "Share your health concerns and I'll provide insights."
    },
    {
      main: "Welcome to SymptomSense!",
      sub: "Describe what you're feeling and let's explore together."
    },
    {
      main: "Good to see you!",
      sub: "What symptoms would you like to discuss today?"
    },
    {
      main: "Hello! Let's get started.",
      sub: "Tell me about any health concerns you have."
    }
  ];

  constructor(
    private chatService: ChatService,
    private voiceService: VoiceService,
    private sessionService: SessionService,
    private conversationService: ConversationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.sessionId = this.sessionService.getSessionId();
    this.isVoiceSupported = this.voiceService.isBrowserSupported();
    this.loadOrCreateConversation();
    this.setRandomWelcomeMessage();
  }

  setRandomWelcomeMessage(): void {
    const randomIndex = Math.floor(Math.random() * this.welcomeMessages.length);
    const selected = this.welcomeMessages[randomIndex];
    this.currentWelcomeMessage = `${selected.main}\n\n${selected.sub}`;
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.sessionService.clearSessionTimer();
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }
    this.saveCurrentConversation();
  }

  sendMessage(): void {
    const trimmedMessage = this.inputMessage.trim();
    
    if (!trimmedMessage && !this.selectedImage) {
      this.showErrorMessage(ERROR_MESSAGES.EMPTY_MESSAGE);
      return;
    }

    // Stop recording if still active
    if (this.isRecording) {
      this.stopRecording();
    }

    // Create user message
    const userMessage: Message = {
      id: this.generateId(),
      type: 'user',
      content: trimmedMessage || '(Image)',
      image: this.selectedImage,
      timestamp: new Date(),
    };

    this.messages.push(userMessage);
    this.shouldScrollToBottom = true;

    // Reset input and image
    const messageToSend = trimmedMessage;
    const imageToSend = this.selectedImage;
    this.inputMessage = '';
    this.selectedImage = null;
    this.imagePreviewUrl = null;

    // Send to API
    this.isLoading = true;
    this.sessionService.resetTimer();

    const subscription = this.chatService
      .sendMessage(messageToSend, imageToSend, this.sessionId)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Create AI message with empty content initially
          const aiMessage: Message = {
            id: this.generateId(),
            type: 'ai',
            content: '',
            image: null,
            timestamp: new Date(),
          };
          this.messages.push(aiMessage);
          this.shouldScrollToBottom = true;
          
          // Animate the response word by word
          this.animateResponse(aiMessage, response.response);
        },
        error: (error) => {
          this.isLoading = false;
          this.showErrorMessage(error.message || ERROR_MESSAGES.API_FAILED);
        },
      });

    this.subscriptions.push(subscription);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (!APP_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      this.showErrorMessage(ERROR_MESSAGES.IMAGE_TYPE);
      input.value = '';
      return;
    }

    // Validate file size
    if (file.size > APP_CONSTANTS.MAX_IMAGE_SIZE_BYTES) {
      this.showErrorMessage(ERROR_MESSAGES.IMAGE_SIZE);
      input.value = '';
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.selectedImage = base64String;
      this.imagePreviewUrl = base64String;
      this.cdr.detectChanges();
      setTimeout(() => this.adjustTextareaHeight(), 0);
    };
    reader.readAsDataURL(file);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreviewUrl = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    setTimeout(() => this.adjustTextareaHeight(), 0);
  }

  toggleRecording(): void {
    if (!this.isVoiceSupported) {
      this.showErrorMessage(ERROR_MESSAGES.VOICE_NOT_SUPPORTED);
      return;
    }

    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  private startRecording(): void {
    this.isRecording = true;
    const subscription = this.voiceService.startRecording().subscribe({
      next: (transcript) => {
        console.log('Transcript received in component:', transcript);
        // Run inside Angular zone to ensure change detection
        this.ngZone.run(() => {
          this.inputMessage = transcript;
          this.cdr.detectChanges();
          setTimeout(() => this.adjustTextareaHeight(), 0);
        });
      },
      error: (error) => {
        console.error('Voice recognition error:', error);
        this.ngZone.run(() => {
          this.isRecording = false;
          const errorMsg = typeof error === 'string' ? error : 'Voice recognition error. Please try again.';
          this.showErrorMessage(errorMsg);
        });
      },
      complete: () => {
        console.log('Voice recognition completed');
        this.ngZone.run(() => {
          this.isRecording = false;
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  private stopRecording(): void {
    this.voiceService.stopRecording();
    this.isRecording = false;
  }

  adjustTextareaHeight(): void {
    const textarea = document.querySelector('.text-input') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  }

  private animateResponse(message: Message, fullText: string): void {
    const words = fullText.split(' ');
    let currentIndex = 0;
    
    const animationInterval = setInterval(() => {
      if (currentIndex < words.length) {
        // Add the next word
        message.content += (currentIndex > 0 ? ' ' : '') + words[currentIndex];
        currentIndex++;
        
        // Trigger change detection and scroll
        this.ngZone.run(() => {
          this.cdr.detectChanges();
          this.shouldScrollToBottom = true;
        });
      } else {
        // Animation complete
        clearInterval(animationInterval);
        // Save conversation after animation completes
        this.saveCurrentConversation();
      }
    }, 50); // 50ms delay between words (adjust for faster/slower)
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;

    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }

    this.errorTimeoutId = setTimeout(() => {
      this.dismissError();
    }, APP_CONSTANTS.ERROR_AUTO_DISMISS_MS);
  }

  dismissError(): void {
    this.showError = false;
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
      this.errorTimeoutId = null;
    }
  }

  onModelChange(): void {
    this.chatService.setProvider(this.selectedModel);
    console.log('AI Model changed to:', this.selectedModel);
  }

  goToLanding(): void {
    this.router.navigate(['/']);
  }

  // Conversation management
  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
    if (this.showSidebar && this.sidebarComponent) {
      this.sidebarComponent.loadConversations();
    }
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }

  loadOrCreateConversation(): void {
    const currentId = this.conversationService.getCurrentConversationId();
    
    if (currentId) {
      const conversation = this.conversationService.getConversation(currentId);
      if (conversation) {
        this.loadConversation(conversation);
        return;
      }
    }
    
    // Create new conversation if none exists
    this.createNewConversation();
  }

  loadConversation(conversation: Conversation): void {
    this.currentConversationId = conversation.id;
    this.messages = conversation.messages;
    this.selectedModel = conversation.model as 'MISTRAL' | 'GEMINI' | 'ASHISH';
    this.chatService.setProvider(this.selectedModel);
    this.shouldScrollToBottom = true;
    this.setRandomWelcomeMessage();
  }

  createNewConversation(): void {
    // Don't create a new conversation if current one is empty
    if (this.messages.length === 0 && this.currentConversationId) {
      this.closeSidebar();
      return;
    }
    
    this.saveCurrentConversation(); // Save current before creating new
    const newConversation = this.conversationService.createConversation(this.selectedModel);
    this.currentConversationId = newConversation.id;
    this.messages = [];
    this.inputMessage = '';
    this.selectedImage = null;
    this.imagePreviewUrl = null;
    this.setRandomWelcomeMessage();
    setTimeout(() => this.adjustTextareaHeight(), 0);
  }

  saveCurrentConversation(): void {
    if (this.currentConversationId && this.messages.length > 0) {
      this.conversationService.updateConversation(
        this.currentConversationId,
        this.messages,
        this.selectedModel
      );
    }
  }

  onConversationSelected(conversationId: string): void {
    this.saveCurrentConversation();
    const conversation = this.conversationService.getConversation(conversationId);
    if (conversation) {
      this.loadConversation(conversation);
      this.conversationService.setCurrentConversationId(conversationId);
    }
    this.closeSidebar();
  }

  onNewConversation(): void {
    this.createNewConversation();
    this.closeSidebar();
  }

  onDeleteConversation(conversationId: string): void {
    this.conversationToDelete = conversationId;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.conversationToDelete) {
      this.conversationService.deleteConversation(this.conversationToDelete);
      
      // If we deleted the current conversation, create a new one
      if (this.conversationToDelete === this.currentConversationId) {
        this.createNewConversation();
      }
      
      // Refresh sidebar
      if (this.sidebarComponent) {
        this.sidebarComponent.loadConversations();
      }
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.conversationToDelete = null;
  }
}
