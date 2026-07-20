import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import feather from 'feather-icons';

import { MissionService } from '../../services/mission.service';
import { Mission } from '../../models/mission';


@Component({
  selector: 'app-mission-details',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './mission-details.html',
  styleUrl: './mission-details.css',
})
export class MissionDetails implements OnInit {



  // ==========================================================
  // DATA
  // ==========================================================


  mission = signal<Mission | null>(null);


  loading = signal(false);



  // ==========================================================
  // TABS
  // ==========================================================


  selectedTab = signal<
    'info'
    | 'assignment'
    | 'inspection'
    | 'documents'
    | 'photos'
  >('info');




  // ==========================================================
  // ASSIGNMENT
  // ==========================================================


  driverId = '';

  vehicleId = '';




  // ==========================================================
  // VERIFICATION
  // ==========================================================


  documentsVerified = signal(false);

  verificationDate = signal<string | null>(null);





  constructor(

    private route: ActivatedRoute,

    private missionService: MissionService,

    private router: Router

  ) { }





  // ==========================================================
  // INIT
  // ==========================================================


  ngOnInit(): void {


    const id = this.route.snapshot.paramMap.get('id');


    if (!id) {

      return;

    }


    this.loadMission(id);


  }






  // ==========================================================
  // LOAD
  // ==========================================================


  loadMission(id: string) {


    this.loading.set(true);



    this.missionService.getById(id)

      .subscribe({

        next: data => {


          this.mission.set(data);


          this.driverId = data.driverId ?? '';

          this.vehicleId = data.vehicleId ?? '';



          this.loading.set(false);



          setTimeout(() => {

            feather.replace();

          }, 0);



        },


        error: err => {


          console.error(err);


          this.loading.set(false);


        }


      });


  }






  refresh() {


    const current = this.mission();


    if (!current) {

      return;

    }


    this.loadMission(current.id);


  }







  // ==========================================================
  // TABS
  // ==========================================================


  selectTab(
    tab:
      'info'
      | 'assignment'
      | 'inspection'
      | 'documents'
      | 'photos'
  ) {


    this.selectedTab.set(tab);



    setTimeout(() => {

      feather.replace();

    }, 0);


  }







  // ==========================================================
  // ASSIGNMENT
  // ==========================================================


  updateAssignment() {


    const current = this.mission();


    if (!current) {

      return;

    }



    const request = {


      title: current.title,


      description: current.description,


      startDate: current.startDate,


      endDate: current.endDate,


      status: current.status,


      driverId:
        this.driverId || null,


      vehicleId:
        this.vehicleId || null


    };




    this.missionService.update(

      current.id,

      request

    )

      .subscribe({

        next: data => {


          this.mission.set(data);


          this.driverId =
            data.driverId ?? '';



          this.vehicleId =
            data.vehicleId ?? '';



        },


        error: err => console.error(err)


      });



  }







  removeAssignment() {


    this.driverId = '';

    this.vehicleId = '';


    this.updateAssignment();


  }







  // ==========================================================
  // DOCUMENT VERIFICATION
  // ==========================================================


  verifyDocuments() {


    this.documentsVerified.set(true);



    this.verificationDate.set(

      new Date().toISOString()

    );



    /*
      Backend endpoint later:

      PATCH /missions/{id}/verify-documents

    */


  }







  // ==========================================================
  // DELETE
  // ==========================================================


  deleteMission() {


    const current = this.mission();


    if (!current) {

      return;

    }



    if (!confirm('Delete this mission ?')) {

      return;

    }




    this.missionService.delete(current.id)

      .subscribe({

        next: () => {


          this.router.navigate([

            '/missions'

          ]);


        },


        error: err => console.error(err)


      });



  }







  // ==========================================================
  // HELPERS
  // ==========================================================


  getStatusClass(status: string) {


    switch (status) {


      case 'ONGOING':

        return 'bg-success';


      case 'COMPLETED':

        return 'bg-primary';


      case 'CANCELLED':

        return 'bg-danger';


      default:

        return 'bg-warning';


    }


  }



}