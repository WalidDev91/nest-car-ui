import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { ToastContainer } from './layout/toast-container/toast-container';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private themeService: ThemeService) { }
}