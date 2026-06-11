import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { filter } from 'rxjs/operators';
import feather from 'feather-icons';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, Navbar, Sidebar, Footer],
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
}