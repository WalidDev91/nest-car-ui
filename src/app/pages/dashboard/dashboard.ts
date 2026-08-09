import { Component, OnInit, signal, effect, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { VehicleService } from '../../services/vehicle.service';
import { MissionService } from '../../services/mission.service';
import { DriverDocumentService } from '../../services/driver-document.service';
import { ThemeService } from '../../services/theme.service';
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

  activeMissionsDelta = signal<number>(0);

  missionStatusCounts = signal<StatusCount[]>([]);
  documentStatusCounts = signal<StatusCount[]>([]);

  recentMissions = signal<Mission[]>([]);

  allMissions: Mission[] = [];
  allDocuments: any[] = [];

  loggedInName =
    `${localStorage.getItem('firstName') ?? ''} ${localStorage.getItem('lastName') ?? ''}`.trim() || 'User';

  dataLoaded = false;

  // ==========================================================
  // CHART INSTANCES — kept so we can destroy() before rebuilding,
  // both on initial load and whenever the theme toggles.
  // ==========================================================

  private missionStatusChart: Chart | null = null;
  private missionsTrendChart: Chart | null = null;
  private documentStatusChartInstance: Chart | null = null;

  private missionChartsReady = false;
  private documentChartReady = false;

  constructor(
    private userService: UserService,
    private vehicleService: VehicleService,
    private missionService: MissionService,
    private driverDocumentService: DriverDocumentService,
    public themeService: ThemeService
  ) {

    // Redraw charts with theme-correct colors whenever dark/light mode
    // toggles while this page is open — otherwise they'd stay stale
    // until a full reload.
    effect(() => {

      this.themeService.theme();

      if (this.missionChartsReady) {
        this.buildStatusChart();
        this.buildTrendChart();
      }

      if (this.documentChartReady) {
        this.buildDocumentChart();
      }

    });

  }

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
  // THEME-AWARE CHART PALETTE
  // ==========================================================

  private getChartPalette() {

    const isDark = this.themeService.theme() === 'dark';

    return {
      // Matches the dashboard card background in each theme, so
      // doughnut segment borders and line-chart point centers blend
      // into the card instead of showing as a hardcoded white ring.
      surfaceColor: isDark ? '#1c2028' : '#ffffff',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      tickColor: isDark ? '#9aa0ac' : '#6c757d'
    };

  }

  // ==========================================================
  // MISSION CHARTS
  // ==========================================================

  buildMissionCharts(): void {
    setTimeout(() => {
      this.buildStatusChart();
      this.buildTrendChart();
      this.missionChartsReady = true;
    }, 0);
  }

  buildStatusChart(): void {

    if (!this.missionStatusChartRef) return;

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

    const palette = this.getChartPalette();

    this.missionStatusChart?.destroy();

    this.missionStatusChart = new Chart(this.missionStatusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Planned', 'Ongoing', 'Completed', 'Cancelled'],
        datasets: [{
          data: [counts.PLANNED, counts.ONGOING, counts.COMPLETED, counts.CANCELLED],
          backgroundColor: ['#ffc107', '#3b7ddd', '#28a745', '#dc3545'],
          borderColor: palette.surfaceColor,
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

    if (!this.missionsTrendChartRef) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);

    this.allMissions.forEach(m => {
      const month = new Date(m.startDate).getMonth();
      counts[month]++;
    });

    const palette = this.getChartPalette();

    const ctx = this.missionsTrendChartRef.nativeElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 225);
    gradient.addColorStop(0, 'rgba(59, 125, 221, 0.35)');
    gradient.addColorStop(1, 'rgba(59, 125, 221, 0)');

    this.missionsTrendChart?.destroy();

    this.missionsTrendChart = new Chart(this.missionsTrendChartRef.nativeElement, {
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
          pointBackgroundColor: palette.surfaceColor,
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
            ticks: { stepSize: 1, color: palette.tickColor },
            grid: { color: palette.gridColor },
            border: { dash: [3, 3] }
          },
          x: {
            ticks: { color: palette.tickColor },
            grid: { color: 'transparent' },
            border: { display: false }
          }
        }
      }
    });
  }

  // ==========================================================
  // DOCUMENT STATUS CHART
  // ==========================================================

  buildDocumentChart(): void {

    if (!this.documentStatusChartRef) return;

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

    const palette = this.getChartPalette();

    setTimeout(() => {

      this.documentStatusChartInstance?.destroy();

      this.documentStatusChartInstance = new Chart(this.documentStatusChartRef.nativeElement, {
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
              ticks: { stepSize: 1, color: palette.tickColor },
              grid: { color: palette.gridColor },
              border: { dash: [3, 3] }
            },
            y: {
              ticks: { color: palette.tickColor },
              grid: { color: 'transparent' },
              border: { display: false }
            }
          }
        }
      });

      this.documentChartReady = true;

    }, 0);

  }
}