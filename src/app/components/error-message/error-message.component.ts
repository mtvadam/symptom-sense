import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css',
})
export class ErrorMessageComponent {
  @Input() message: string = '';
  @Input() show: boolean = false;
  @Output() dismiss = new EventEmitter<void>();

  onDismiss(): void {
    this.dismiss.emit();
  }
}

