import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  private currentKey = this.buildStorageKey();

  theme = signal<Theme>(this.getInitialTheme());

  constructor() {

    effect(() => {

      const theme = this.theme();

      document.documentElement.setAttribute('data-bs-theme', theme);

      localStorage.setItem(this.currentKey, theme);

    });

  }

  private buildStorageKey(): string {

    const userId = localStorage.getItem('userId') ?? 'anonymous';

    return `app-theme:${userId}`;

  }

  private getInitialTheme(): Theme {

    const stored = localStorage.getItem(this.currentKey) as Theme | null;

    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  }

  toggle(): void {

    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');

  }

  // Call this right after login and right after logout, so the signal
  // re-reads the correct account's saved theme instead of keeping
  // whatever was in memory from the previous session.
  reloadForCurrentUser(): void {

    this.currentKey = this.buildStorageKey();

    this.theme.set(this.getInitialTheme());

  }

}