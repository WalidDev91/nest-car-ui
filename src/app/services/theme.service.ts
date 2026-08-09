import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  private readonly storageKey = 'app-theme';

  theme = signal<Theme>(this.getInitialTheme());

  constructor() {

    effect(() => {

      const theme = this.theme();

      document.documentElement.setAttribute('data-bs-theme', theme);

      localStorage.setItem(this.storageKey, theme);

    });

  }

  private getInitialTheme(): Theme {

    const stored = localStorage.getItem(this.storageKey) as Theme | null;

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

}
