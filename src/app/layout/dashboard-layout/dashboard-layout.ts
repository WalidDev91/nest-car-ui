import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { ChatWidget } from '../chat-widget/chat-widget';
import { filter } from 'rxjs/operators';
import feather from 'feather-icons';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, Navbar, Sidebar, Footer, ChatWidget, NgIf],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    setTimeout(() => feather.replace(), 0);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      setTimeout(() => feather.replace(), 0);
    });
  }

  get canUseAssistant(): boolean {
    const role = localStorage.getItem('role');
    return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FLEET_MANAGER';
  }

}