import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent implements OnInit, OnDestroy {
  @Input() message!: Message;
  @ViewChild('messageText') messageTextElement!: ElementRef;

  playing = false;
  displayedText = '';
  words: string[] = [];
  currentWordIndex = -1;

  private utterance: SpeechSynthesisUtterance | null = null;
  private wordTimings: Array<{word: string, start: number, end: number}> = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.displayedText = this.message?.content || '';
    
    if (this.message?.type === 'ai') {
      this.prepareWords();
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
    if (this.playing) {
      this.stopReadAloud();
    } else {
      this.startReadAloud(0);
    }
  }

  onWordClick(wordIndex: number): void {
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

    this.stopReadAloud();

    this.playing = true;
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
            this.currentWordIndex = -1;
            this.cdr.detectChanges();
          };

          this.utterance.onerror = (event: any) => {
            console.error('SpeechSynthesis error:', event);
            this.playing = false;
            this.currentWordIndex = -1;
            this.cdr.detectChanges();
          };

          window.speechSynthesis.speak(this.utterance);
        } catch (e) {
          console.error('SpeechSynthesis error', e);
          this.playing = false;
          this.currentWordIndex = -1;
        }
      }
    }
  }

  stopReadAloud(): void {
    this.playing = false;
    this.currentWordIndex = -1;
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
