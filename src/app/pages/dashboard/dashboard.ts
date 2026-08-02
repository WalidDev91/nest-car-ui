import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { VehicleService } from '../../services/vehicle.service';
import { MissionService } from '../../services/mission.service';
import { DriverDocumentService } from '../../services/driver-document.service';
import { Mission } from '../../models/mission';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface StatusCount {
  label: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {

  @ViewChild('missionStatusChart') missionStatusChartRef!: ElementRef;
  @ViewChild('missionsTrendChart') missionsTrendChartRef!: ElementRef;
  @ViewChild('documentStatusChart') documentStatusChartRef!: ElementRef;

  // summary cards
  totalVehicles = signal<number>(0);
  totalDrivers = signal<number>(0);
  activeMissions = signal<number>(0);
  pendingDocuments = signal<number>(0);

  // delta (this month vs last month), based on startDate
  activeMissionsDelta = signal<number>(0);

  // legend table under the Missions by Status doughnut
  missionStatusCounts = signal<StatusCount[]>([]);
  documentStatusCounts = signal<StatusCount[]>([]);

  // recent missions
  recentMissions = signal<Mission[]>([]);

  // raw data for charts
  allMissions: Mission[] = [];
  allDocuments: any[] = [];

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
        this.activeMissions.set(data.filter(m => m.status === 'ONGOING').length);
        this.recentMissions.set(data.slice(0, 5));
        this.allMissions = data;
        this.dataLoaded = true;

        this.computeDeltas();
        this.buildMissionCharts();
      }
    });

    this.driverDocumentService.getAll().subscribe({
      next: (docs) => {
        this.allDocuments = docs;
        this.pendingDocuments.set(docs.filter(d => d.status === 'PENDING').length);

        this.buildDocumentChart();

        this.userService.getAll().subscribe({
          next: (users) => {
            const drivers = users.filter(u => u.role === 'DRIVER');
            this.totalDrivers.set(drivers.length);
          }
        });
      }
    });
  }

  ngAfterViewInit(): void { }

  // ==========================================================
  // DELTAS — this month vs last month, based on startDate
  // ==========================================================

  computeDeltas(): void {

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const inMonth = (dateStr: string, month: number, year: number) => {
      const d = new Date(dateStr);
      return d.getMonth() === month && d.getFullYear() === year;
    };

    const activeThisMonth = this.allMissions.filter(
      m => m.status === 'ONGOING' && inMonth(m.startDate, thisMonth, thisYear)
    ).length;
    const activeLastMonth = this.allMissions.filter(
      m => m.status === 'ONGOING' && inMonth(m.startDate, lastMonth, lastMonthYear)
    ).length;

    this.activeMissionsDelta.set(this.percentChange(activeLastMonth, activeThisMonth));

  }

  private percentChange(previous: number, current: number): number {
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  // ==========================================================
  // MISSION CHARTS
  // ==========================================================

  buildMissionCharts(): void {
    setTimeout(() => {
      this.buildStatusChart();
      this.buildTrendChart();
    }, 0);
  }

  buildStatusChart(): void {

    const counts = {
      PLANNED: this.allMissions.filter(m => m.status === 'PLANNED').length,
      ONGOING: this.allMissions.filter(m => m.status === 'ONGOING').length,
      COMPLETED: this.allMissions.filter(m => m.status === 'COMPLETED').length,
      CANCELLED: this.allMissions.filter(m => m.status === 'CANCELLED').length,
    };

    this.missionStatusCounts.set([
      { label: 'Planned', count: counts.PLANNED, color: '#ffc107' },
      { label: 'Ongoing', count: counts.ONGOING, color: '#3b7ddd' },
      { label: 'Completed', count: counts.COMPLETED, color: '#28a745' },
      { label: 'Cancelled', count: counts.CANCELLED, color: '#dc3545' },
    ]);

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
        cutout: '75%',
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  buildTrendChart(): void {

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);

    this.allMissions.forEach(m => {
      const month = new Date(m.startDate).getMonth();
      counts[month]++;
    });

    const ctx = this.missionsTrendChartRef.nativeElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 225);
    gradient.addColorStop(0, 'rgba(59, 125, 221, 0.35)');
    gradient.addColorStop(1, 'rgba(59, 125, 221, 0)');

    new Chart(this.missionsTrendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Missions Starting',
          data: counts,
          fill: true,
          backgroundColor: gradient,
          borderColor: '#3b7ddd',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#3b7ddd',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          tension: 0.4
        }]
      },
      options: {
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: 'rgba(0,0,0,0.05)' },
            border: { dash: [3, 3] }
          },
          x: {
            grid: { color: 'transparent' },
            border: { display: false }
          }
        }
      }
    });
  }

  // ==========================================================
  // DOCUMENT STATUS CHART — different data dimension entirely,
  // horizontal bar so it's visually distinct from the mission charts
  // ==========================================================

  buildDocumentChart(): void {

    const counts = {
      PENDING: this.allDocuments.filter(d => d.status === 'PENDING').length,
      APPROVED: this.allDocuments.filter(d => d.status === 'APPROVED').length,
      REJECTED: this.allDocuments.filter(d => d.status === 'REJECTED').length,
    };

    this.documentStatusCounts.set([
      { label: 'Pending', count: counts.PENDING, color: '#ffc107' },
      { label: 'Approved', count: counts.APPROVED, color: '#28a745' },
      { label: 'Rejected', count: counts.REJECTED, color: '#dc3545' },
    ]);

    setTimeout(() => {

      new Chart(this.documentStatusChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Pending', 'Approved', 'Rejected'],
          datasets: [{
            data: [counts.PENDING, counts.APPROVED, counts.REJECTED],
            backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
            borderWidth: 0,
            borderRadius: 4,
            barPercentage: 0.6
          }]
        },
        options: {
          indexAxis: 'y',
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
              grid: { color: 'rgba(0,0,0,0.05)' },
              border: { dash: [3, 3] }
            },
            y: {
              grid: { color: 'transparent' },
              border: { display: false }
            }
          }
        }
      });

    }, 0);

  }
}