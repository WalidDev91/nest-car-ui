import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { User } from '../../services/user';


@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {

  users: any[] = [];

  constructor(private user: User) {}

  ngOnInit() {
    this.user.getAll().subscribe({
      next: (data) => {
        console.log('Users from backend:', data);
        this.users = data;
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }
}
