import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { DriverDocument } from '../../models/driver-document';
import { DriverDocumentService } from '../../services/driver-document.service';

@Component({
  selector: 'app-user-details',
  imports: [CommonModule],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetails implements OnInit {

  user = signal<User | null>(null);
  selectedTab = signal<'info' | 'documents'>('info');

  driverDocs = signal<DriverDocument[]>([]);

  hasLicense = signal(false);
  hasIdCard = signal(false);

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private driverDocumentService: DriverDocumentService
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    this.userService.getById(id).subscribe({
      next: (user) => {
        this.user.set(user);

        // ONLY for drivers
        if (user.role === 'DRIVER') {
          this.loadDriverDocs(user.id);
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadDriverDocs(driverId: string) {
    this.driverDocumentService.getByDriverId(driverId).subscribe({
      next: (docs) => {
        this.driverDocs.set(docs);

        this.hasLicense.set(
          docs.some(d => d.type === 'DRIVER_LICENSE')
        );

        this.hasIdCard.set(
          docs.some(d => d.type === 'ID_CARD')
        );
      },
      error: (err) => console.error(err)
    });
  }

  selectTab(tab: 'info' | 'documents') {
    this.selectedTab.set(tab);
  }
}