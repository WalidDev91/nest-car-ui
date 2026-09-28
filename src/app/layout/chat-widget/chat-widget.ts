import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { marked } from 'marked';
import { ThemeService } from '../../services/theme.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  html?: string;
  error?: boolean;
}

@Component({
  selector: 'app-chat-widget',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css',
})
export class ChatWidget {

  @ViewChild('scrollArea') scrollArea?: ElementRef<HTMLDivElement>;

  // Change this if your services use an environment file / different base URL
  private readonly apiUrl = 'http://localhost:8080/api/assistant/chat';

  isOpen = signal(false);
  loading = signal(false);
  messages = signal<ChatMessage[]>([]);

  input = '';

  suggestions = [
    'Which driver documents are expired?',
    'How many missions are in each status?',
    'Which vehicle documents expire before October 2026?',
    'Show all ongoing missions',
  ];

  constructor(
    private http: HttpClient,
    public themeService: ThemeService
  ) { }

  // Only logged-in, non-driver users see the assistant
  canUse(): boolean {
    return !!localStorage.getItem('token') && localStorage.getItem('role') !== 'DRIVER';
  }

  toggle(): void {
    this.isOpen.update(v => !v);

    if (this.isOpen()) {
      this.scrollToBottom();
    }
  }

  clear(): void {
    this.messages.set([]);
  }

  send(text?: string): void {

    const question = (text ?? this.input).trim();

    if (!question || this.loading()) return;

    this.input = '';
    this.messages.update(m => [...m, { role: 'user', text: question }]);
    this.loading.set(true);
    this.scrollToBottom();

    const headers = new HttpHeaders({
      'Content-Type': 'text/plain',
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
    });

    this.http.post(this.apiUrl, question, { headers, responseType: 'text' }).subscribe({

      next: (reply) => this.addAssistantMessage(reply),

      error: (err: HttpErrorResponse) => {
        const expired = err.status === 401 || err.status === 403;

        this.addAssistantMessage(
          expired
            ? 'Your session has expired. Please log in again.'
            : 'Something went wrong. Please try again.',
          true
        );
      },

    });
  }

  private addAssistantMessage(text: string, error = false): void {

    const html = marked.parse(text, { async: false }) as string;

    this.messages.update(m => [...m, { role: 'assistant', text, html, error }]);
    this.loading.set(false);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollArea?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }

}