import { Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { marked } from 'marked';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';

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
export class ChatWidget implements OnInit {

  @ViewChild('scrollArea') scrollArea?: ElementRef<HTMLDivElement>;

  private readonly apiUrl = `${environment.apiUrl}/assistant/chat`;

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

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!this.canUse() || !token) return;

    // Welcome once per login: a new login means a new token
    if (sessionStorage.getItem('chatWelcomedFor') === token) return;
    sessionStorage.setItem('chatWelcomedFor', token);

    setTimeout(() => {
      this.addAssistantMessage(
        "Hi! 👋 I'm the **Nest-Car Assistant**. How can I help you today?\n\n" +
        "Try asking: *Show all ongoing missions*."
      );
      this.isOpen.set(true);
    }, 1000);
  }

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
    this.playSound('send');
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

    // Make /uploads/ image links work in dev (uploadsUrl is '' in production)
    const withUploadsUrl = text.replace(/\]\(\/uploads\//g, `](${environment.uploadsUrl}/uploads/`);

    //const html = marked.parse(withUploadsUrl, { async: false }) as string;
    const html = (marked.parse(withUploadsUrl, { async: false }) as string)
      .replace(/<img /g, '<img width="180" ');

    this.messages.update(m => [...m, { role: 'assistant', text, html, error }]);
    this.loading.set(false);
    if (!error) this.playSound('receive');
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollArea?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }


  private audioCtx?: AudioContext;

  private playSound(type: 'send' | 'receive'): void {
    try {
      this.audioCtx ??= new AudioContext();
      const ctx = this.audioCtx;

      if (ctx.state === 'suspended') ctx.resume();

      const notes = type === 'send' ? [660] : [880, 1175];

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + i * 0.09;

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);

        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch {
      // sound is optional, ignore any audio error
    }
  }
}