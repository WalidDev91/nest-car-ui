import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';



@Component({
  selector: 'app-users',
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {

  users = signal<User[]>([]);

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
      },
      error: (err) => {
        console.error('User error:', err);
      }
    });
  }
}