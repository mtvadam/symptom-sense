import { Component, Input, OnInit, OnDestroy, OnChanges, DoCheck, SimpleChanges, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent implements OnInit, OnDestroy, OnChanges, DoCheck {
  @Input() message!: Message;
  @ViewChild('messageText') messageTextElement!: ElementRef;

  playing = false;
  paused = false;
  displayedText = '';
  words: string[] = [];
  currentWordIndex = -1;

  private utterance: SpeechSynthesisUtterance | null = null;
  private wordTimings: Array<{word: string, start: number, end: number}> = [];
  private startWordIndex = 0;
  private pausedAtWordIndex = -1;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.displayedText = this.message?.content || '';
    
    if (this.message?.type === 'ai') {
      this.prepareWords();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message']) {
      this.displayedText = this.message?.content || '';
      
      if (this.message?.type === 'ai') {
        this.prepareWords();
      }
    }
  }

  ngDoCheck(): void {
    // Check if message content has changed (for streaming text)
    const currentContent = this.message?.content || '';
    if (currentContent !== this.displayedText) {
      this.displayedText = currentContent;
      if (this.message?.type === 'ai') {
        this.prepareWords();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopReadAloud();
  }

  private prepareWords(): void {
    const text = (this.message && this.message.content) ? String(this.message.content).trim() : '';
    // Split by spaces while preserving punctuation with words
    // Filter out standalone punctuation marks like dashes
    this.words = text ? text.split(/\s+/).filter(word => {
      // Keep words that have at least one alphanumeric character
      // This filters out standalone dashes, hyphens, etc.
      return /[a-zA-Z0-9]/.test(word);
    }) : [];
  }

  togglePlay(): void {
    if (this.playing && !this.paused) {
      // Pause the playback
      this.pauseReadAloud();
    } else if (this.paused) {
      // Resume the playback
      this.resumeReadAloud();
    } else {
      // Start new playback from beginning
      this.startReadAloud(0);
    }
  }

  onWordClick(wordIndex: number): void {
    // Stop current playback and start from clicked word
    this.stopReadAloud();
    this.startReadAloud(wordIndex);
  }

  startReadAloud(startWordIndex: number = 0): void {
    if (!this.words || this.words.length === 0) {
      this.prepareWords();
    }

    if (startWordIndex >= this.words.length) {
      return;
    }

    // Only stop if not resuming from a pause
    if (!this.paused) {
      this.stopReadAloud();
    } else {
      // If resuming, just cancel any existing speech
      if (this.utterance) {
        window.speechSynthesis.cancel();
        this.utterance = null;
      }
    }

    this.playing = true;
    this.paused = false;
    this.startWordIndex = startWordIndex;
    this.currentWordIndex = startWordIndex;

    if ('speechSynthesis' in window) {
      const textToSpeak = this.words.slice(startWordIndex).join(' ');
      
      if (textToSpeak) {
        try {
          this.utterance = new SpeechSynthesisUtterance(textToSpeak);
          this.utterance.rate = 1.0;
          this.utterance.lang = 'en-US';

          let wordBoundaryCount = 0;

          this.utterance.onboundary = (event: any) => {
            if (event.name === 'word') {
              this.currentWordIndex = startWordIndex + wordBoundaryCount;
              wordBoundaryCount++;
              this.cdr.detectChanges();
            }
          };

          this.utterance.onend = () => {
            this.playing = false;
            this.paused = false;
            this.currentWordIndex = -1;
            this.cdr.detectChanges();
          };

          this.utterance.onerror = (event: any) => {
            console.error('SpeechSynthesis error:', event);
            this.playing = false;
            this.paused = false;
            this.currentWordIndex = -1;
            this.cdr.detectChanges();
          };

          window.speechSynthesis.speak(this.utterance);
        } catch (e) {
          console.error('SpeechSynthesis error', e);
          this.playing = false;
          this.paused = false;
          this.currentWordIndex = -1;
        }
      }
    }
  }

  pauseReadAloud(): void {
    if (this.playing && !this.paused && 'speechSynthesis' in window) {
      // Save the current word index before pausing
      this.pausedAtWordIndex = this.currentWordIndex;
      
      // Clear the utterance handlers to prevent them from resetting state
      if (this.utterance) {
        this.utterance.onend = null;
        this.utterance.onerror = null;
      }
      
      window.speechSynthesis.cancel(); // Cancel instead of pause for reliability
      this.paused = true;
      this.utterance = null;
      this.cdr.detectChanges();
    }
  }

  resumeReadAloud(): void {
    if (this.paused && 'speechSynthesis' in window) {
      // Don't set paused = false here; let startReadAloud handle it
      // Restart from the paused word index for reliable word tracking
      const resumeFromIndex = this.pausedAtWordIndex >= 0 ? this.pausedAtWordIndex : this.currentWordIndex;
      this.startReadAloud(resumeFromIndex);
    }
  }

  stopReadAloud(): void {
    this.playing = false;
    this.paused = false;
    this.currentWordIndex = -1;
    this.pausedAtWordIndex = -1;
    if (this.utterance) {
      window.speechSynthesis.cancel();
      this.utterance = null;
    }
    this.cdr.detectChanges();
  }

  isWordHighlighted(index: number): boolean {
    return this.currentWordIndex === index;
  }
}
