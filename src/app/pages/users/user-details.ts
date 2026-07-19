import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { DriverDocument } from '../../models/driver-document';
import { DriverDocumentService } from '../../services/driver-document.service';

import feather from 'feather-icons';


@Component({
  selector: 'app-user-details',
  imports: [CommonModule],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetails implements OnInit {


  // ==========================
  // STATE
  // ==========================

  user = signal<User | null>(null);

  driverDocs = signal<DriverDocument[]>([]);

  selectedTab = signal<'info' | 'documents'>('info');

  loading = signal(false);

  error = signal('');



  // ==========================
  // DRIVER DOCUMENT STATUS
  // ==========================

  hasLicense = signal(false);

  hasIdCard = signal(false);



  // ==========================
  // CURRENT USER
  // ==========================

  userId = '';



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private driverDocumentService: DriverDocumentService
  ) { }



  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');


    if (!id) {

      this.error.set('Invalid user id');

      return;

    }


    this.userId = id;

    this.loadUser();

  }



  // ==========================
  // LOAD USER
  // ==========================


  loadUser(): void {


    this.loading.set(true);

    this.error.set('');


    this.userService.getById(this.userId)
      .subscribe({

        next: user => {


          this.user.set(user);


          this.loading.set(false);



          if (this.isDriver()) {

            this.loadDriverDocs(user.id);

          }



          setTimeout(() => {

            feather.replace();

          }, 0);


        },


        error: err => {

          console.error(err);

          this.error.set('Unable to load user information.');

          this.loading.set(false);

        }

      });


  }




  // ==========================
  // DRIVER DOCUMENTS
  // ==========================


  loadDriverDocs(driverId: string): void {


    this.driverDocumentService.getByDriverId(driverId)
      .subscribe({

        next: docs => {


          this.driverDocs.set(docs);


          this.hasLicense.set(

            docs.some(
              doc => doc.type === 'DRIVER_LICENSE'
            )

          );


          this.hasIdCard.set(

            docs.some(
              doc => doc.type === 'ID_CARD'
            )

          );


        },


        error: err => {

          console.error(
            'Driver documents error:',
            err
          );

        }

      });


  }




  // ==========================
  // TABS
  // ==========================


  selectTab(
    tab: 'info' | 'documents'
  ): void {


    this.selectedTab.set(tab);


    setTimeout(() => {

      feather.replace();

    }, 0);


  }





  // ==========================
  // HELPERS
  // ==========================


  isDriver(): boolean {


    return this.user()?.role === 'DRIVER';


  }


  isAdmin(): boolean {


    const role = this.user()?.role;


    return role === 'ADMIN'
      || role === 'SUPER_ADMIN';


  }




  hasCompleteDocuments(): boolean {


    return this.hasLicense()
      && this.hasIdCard();


  }




  // ==========================
  // NAVIGATION
  // ==========================


  goBack(): void {


    this.router.navigate(['/users']);


  }




  refresh(): void {


    this.loadUser();


  }



}