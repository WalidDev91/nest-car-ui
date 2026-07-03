import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import feather from 'feather-icons';


@Component({
  selector: 'app-users',
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {

  users = signal<User[]>([]);

  constructor(private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
  this.userService.getAll().subscribe({
    next: (data) => {
      this.users.set(data);

      setTimeout(() => feather.replace(), 0);
    },
    error: (err) => {
      console.error('User error:', err);
    }
  });
}

  viewDetails(id: string) {
    this.router.navigate(['/users', id]);
  }
}