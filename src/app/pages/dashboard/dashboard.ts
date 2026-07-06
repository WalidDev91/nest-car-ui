import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { VehicleService } from '../../services/vehicle.service';
import { MissionService } from '../../services/mission.service';
import { DriverDocumentService } from '../../services/driver-document.service';
import { Mission } from '../../models/mission';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {

  @ViewChild('missionStatusChart') missionStatusChartRef!: ElementRef;
  @ViewChild('missionsPerMonthChart') missionsPerMonthChartRef!: ElementRef;

  // summary cards
  totalDrivers = signal<number>(0);
  totalVehicles = signal<number>(0);
  totalMissions = signal<number>(0);
  activeMissions = signal<number>(0);
  pendingDocuments = signal<number>(0);
  totalDocuments = signal<number>(0);
  driversWithMissingDocs = signal<number>(0);
  totalUsers = signal<number>(0);

  // recent missions
  recentMissions = signal<Mission[]>([]);

  // raw missions for charts
  allMissions: Mission[] = [];

  // logged in user
  loggedInName =
    `${localStorage.getItem('firstName') ?? ''} ${localStorage.getItem('lastName') ?? ''}`.trim() || 'User';

  dataLoaded = false;

  constructor(
    private userService: UserService,
    private vehicleService: VehicleService,
    private missionService: MissionService,
    private driverDocumentService: DriverDocumentService
  ) { }

  ngOnInit(): void {

    this.vehicleService.getAll().subscribe({
      next: (data) => {
        this.totalVehicles.set(data.length);
      }
    });

    this.missionService.getAll().subscribe({
      next: (data) => {
        this.totalMissions.set(data.length);
        this.activeMissions.set(data.filter(m => m.status === 'ONGOING').length);
        this.recentMissions.set(data.slice(0, 5));
        this.allMissions = data;
        this.dataLoaded = true;
        this.buildCharts();
      }
    });

    this.driverDocumentService.getAll().subscribe({
      next: (docs) => {
        this.totalDocuments.set(docs.length);
        this.pendingDocuments.set(docs.filter(d => d.status === 'PENDING').length);

        // check missing docs per driver
        this.userService.getAll().subscribe({
          next: (users) => {
            const drivers = users.filter(u => u.role === 'DRIVER');
            this.totalDrivers.set(drivers.length);
            this.totalUsers.set(users.length);

            let missing = 0;
            drivers.forEach(driver => {
              const driverDocs = docs.filter(d => d.driverId === driver.id);
              const hasLicense = driverDocs.some(d => d.type === 'DRIVER_LICENSE' && d.status === 'APPROVED');
              const hasId = driverDocs.some(d => d.type === 'ID_CARD' && d.status === 'APPROVED');
              if (!hasLicense || !hasId) missing++;
            });
            this.driversWithMissingDocs.set(missing);
          }
        });
      }
    });
  }

  ngAfterViewInit(): void { }

  buildCharts(): void {
    setTimeout(() => {
      this.buildStatusChart();
      this.buildMonthChart();
    }, 0);
  }

  buildStatusChart(): void {
    const counts = {
      PLANNED: this.allMissions.filter(m => m.status === 'PLANNED').length,
      ONGOING: this.allMissions.filter(m => m.status === 'ONGOING').length,
      COMPLETED: this.allMissions.filter(m => m.status === 'COMPLETED').length,
      CANCELLED: this.allMissions.filter(m => m.status === 'CANCELLED').length,
    };

    new Chart(this.missionStatusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Planned', 'Ongoing', 'Completed', 'Cancelled'],
        datasets: [{
          data: [counts.PLANNED, counts.ONGOING, counts.COMPLETED, counts.CANCELLED],
          backgroundColor: ['#ffc107', '#3b7ddd', '#28a745', '#dc3545'],
          borderWidth: 5
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  buildMonthChart(): void {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);

    this.allMissions.forEach(m => {
      const month = new Date(m.createdAt).getMonth();
      counts[month]++;
    });

    new Chart(this.missionsPerMonthChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Missions',
          data: counts,
          backgroundColor: '#3b7ddd',
          borderColor: '#3b7ddd',
          borderWidth: 1,
          barPercentage: 0.75,
          categoryPercentage: 0.5
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            grid: { color: 'transparent' }
          }
        }
      }
    });
  }
}