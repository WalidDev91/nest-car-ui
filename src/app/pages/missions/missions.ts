import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import feather from 'feather-icons';

import { MissionService } from '../../services/mission.service';
import { Mission } from '../../models/mission';


@Component({
  selector: 'app-missions',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './missions.html',
  styleUrl: './missions.css',
})
export class Missions implements OnInit {


  // ==========================================================
  // DATA
  // ==========================================================


  missions = signal<Mission[]>([]);

  selectedMission = signal<Mission | null>(null);



  loading = signal(false);



  // ==========================================================
  // ROLE
  // ==========================================================


  role = localStorage.getItem('role');


  get isDriver() {

    return this.role === 'DRIVER';

  }


  get isFleetManager() {

    return this.role === 'FLEET_MANAGER';

  }


  get isAdmin() {

    return this.role === 'ADMIN';

  }


  get isSuperAdmin() {

    return this.role === 'SUPER_ADMIN';

  }



  // ==========================================================
  // MODAL
  // ==========================================================


  showModal = false;


  editMode = false;



  // ==========================================================
  // FORM
  // ==========================================================


  title = '';

  description = '';

  startDate = '';

  endDate = '';


  status:
    'PLANNED'
    | 'ONGOING'
    | 'COMPLETED'
    | 'CANCELLED'
    = 'PLANNED';



  driverId = '';

  vehicleId = '';




  constructor(

    private missionService: MissionService,

    private router: Router

  ) { }



  // ==========================================================
  // INIT
  // ==========================================================


  ngOnInit(): void {


    this.loadMissions();


  }




  // ==========================================================
  // LOAD
  // ==========================================================


  loadMissions() {


    this.loading.set(true);


    this.missionService.getAll()

      .subscribe({

        next: data => {


          this.missions.set(data);


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




  // ==========================================================
  // REFRESH
  // ==========================================================


  refresh() {


    this.loadMissions();


  }




  // ==========================================================
  // CREATE / UPDATE MODAL
  // ==========================================================


  openCreateModal() {


    this.editMode = false;


    this.resetForm();


    this.showModal = true;


  }




  openEditModal(mission: Mission) {


    this.editMode = true;


    this.selectedMission.set(mission);



    this.title = mission.title;

    this.description = mission.description;

    this.startDate = mission.startDate;

    this.endDate = mission.endDate;

    this.status = mission.status;


    this.driverId = mission.driverId;

    this.vehicleId = mission.vehicleId;



    this.showModal = true;


  }




  closeModal() {


    this.showModal = false;


    this.selectedMission.set(null);


    this.resetForm();


  }





  // ==========================================================
  // SAVE
  // ==========================================================


  saveMission() {


    const request = {


      title: this.title,


      description: this.description,


      startDate: this.startDate,


      endDate: this.endDate,


      status: this.status,


      driverId: this.driverId || null,


      vehicleId: this.vehicleId || null


    };




    // UPDATE

    if (this.editMode && this.selectedMission()) {


      this.missionService.update(

        this.selectedMission()!.id,

        request

      )

        .subscribe({

          next: () => {


            this.loadMissions();


            this.closeModal();


          },


          error: err => console.error(err)


        });



      return;


    }




    // CREATE


    this.missionService.create(request)

      .subscribe({

        next: () => {


          this.loadMissions();


          this.closeModal();



        },


        error: err => console.error(err)


      });



  }





  // ==========================================================
  // DELETE
  // ==========================================================


  deleteMission(id: string) {



    if (!confirm('Delete this mission ?')) {

      return;

    }



    this.missionService.delete(id)

      .subscribe({

        next: () => {


          this.loadMissions();


        },


        error: err => console.error(err)


      });



  }





  // ==========================================================
  // DETAILS
  // ==========================================================


  viewMissionDetails(id: string) {


    this.router.navigate([

      '/missions',

      id

    ]);


  }





  // ==========================================================
  // HELPERS
  // ==========================================================


  resetForm() {


    this.title = '';

    this.description = '';

    this.startDate = '';

    this.endDate = '';


    this.status = 'PLANNED';


    this.driverId = '';

    this.vehicleId = '';


  }




  getStatusClass(status: string): string {

  switch (status) {

    case 'PLANNED':
      return 'bg-warning';

    case 'ONGOING':
      return 'bg-primary';

    case 'COMPLETED':
      return 'bg-success';

    case 'CANCELLED':
      return 'bg-danger';

    default:
      return 'bg-secondary';

  }

}



}