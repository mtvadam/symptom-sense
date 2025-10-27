import { Component, Input, OnInit, OnDestroy, OnChanges, DoCheck, SimpleChanges, ChangeDetectorRef } from '@angular/core';
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

  playing = false;
  paused = false;
  displayedText = '';
  words: string[] = [];
  currentWordIndex = -1;

  private utterance: SpeechSynthesisUtterance | null = null;
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
    
    if (!text) {
      this.words = [];
      return;
    }
    
    // Split text while preserving line breaks
    const lines = text.split('\n');
    this.words = [];
    
    lines.forEach((line, lineIndex) => {
      // Split each line into words
      const lineWords = line.split(/\s+/).filter(word => {
        // Keep words that have at least one alphanumeric character
        return /[a-zA-Z0-9]/.test(word);
      });
      
      // Add words from this line
      this.words.push(...lineWords);
      
      // Add line break marker (except for last line)
      if (lineIndex < lines.length - 1) {
        this.words.push('\n');
      }
    });
  }

  togglePlay(): void {
    if (this.playing && !this.paused) {
      // Pause the playback
      this.pauseReadAloud();
    } else if (this.paused) {
      // Resume from paused position
      this.resumeReadAloud();
    } else {
      // Start new playback from beginning
      this.startReadAloud(0);
    }
  }

  onWordClick(wordIndex: number): void {
    // Skip if clicking on a line break
    if (this.words[wordIndex] === '\n') {
      return;
    }
    
    // Fully stop current playback
    this.playing = false;
    this.paused = false;
    this.currentWordIndex = -1;
    
    if (this.utterance) {
      window.speechSynthesis.cancel();
      this.utterance = null;
    }
    
    // Small delay to ensure previous utterance is fully canceled
    setTimeout(() => {
      this.startReadAloud(wordIndex);
    }, 50);
  }

  startReadAloud(startWordIndex: number = 0): void {
    if (!this.words || this.words.length === 0) {
      this.prepareWords();
    }

    if (startWordIndex >= this.words.length) {
      return;
    }

    this.stopReadAloud();

    // Filter out line breaks when creating speech text
    const textToSpeak = this.words
      .slice(startWordIndex)
      .filter(word => word !== '\n')
      .join(' ');
    
    if (!textToSpeak.trim()) {
      return;
    }

    this.playing = true;
    this.currentWordIndex = startWordIndex;

    if ('speechSynthesis' in window) {
      try {
        this.utterance = new SpeechSynthesisUtterance(textToSpeak);
        this.utterance.rate = 1.0;
        this.utterance.lang = 'en-US';

        let wordBoundaryCount = 0;

        this.utterance.onboundary = (event: any) => {
          if (event.name === 'word') {
            // Calculate the actual word index in the full words array
            let actualIndex = startWordIndex;
            let spokenWordsSoFar = 0;
            
            // Advance through words array, skipping line breaks
            while (spokenWordsSoFar < wordBoundaryCount && actualIndex < this.words.length) {
              if (this.words[actualIndex] !== '\n') {
                spokenWordsSoFar++;
              }
              actualIndex++;
            }
            
            // Skip any line breaks at current position
            while (actualIndex < this.words.length && this.words[actualIndex] === '\n') {
              actualIndex++;
            }
            
            this.currentWordIndex = actualIndex;
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
        this.currentWordIndex = -1;
      }
    }
  }

  pauseReadAloud(): void {
    if (this.playing && !this.paused) {
      // Save current word position
      this.pausedAtWordIndex = this.currentWordIndex;
      
      // Use browser's pause (more reliable than cancel for resume)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      
      this.paused = true;
      this.playing = false;
      this.cdr.detectChanges();
    }
  }

  resumeReadAloud(): void {
    if (this.paused) {
      this.paused = false;
      this.playing = true;
      
      // Use browser's resume
      if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
      
      this.cdr.detectChanges();
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
