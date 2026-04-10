import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet,Sidebar,Navbar,Footer],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

}
