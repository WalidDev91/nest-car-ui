import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdministrationService } from '../../services/administration.service';
import { AppSettings } from '../../models/app-settings';
import { AuditLog } from '../../models/audit-log';
import { ThemeService } from '../../services/theme.service';
import feather from 'feather-icons';

@Component({
  selector: 'app-administration',
  imports: [CommonModule, FormsModule],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration implements OnInit {

  // ==========================
  // STATE
  // ==========================

  pendingRequests = signal<any[]>([]);

  auditLogs = signal<AuditLog[]>([]);

  auditSearch = signal('');

  loadingSettings = signal(false);

  savingSettings = signal(false);

  loadingAudit = signal(false);

  selectedTab = signal<'requests' | 'settings' | 'audit'>('requests');

  settings: AppSettings = {
    applicationName: '',
    language: 'EN',
    sessionTimeout: 30
  };

  constructor(
    private administrationService: AdministrationService,
    public themeService: ThemeService
  ) { }

  ngOnInit(): void {

    this.loadPendingRequests();
    this.loadSettings();
    this.loadAuditLogs();

  }

  selectTab(tab: 'requests' | 'settings' | 'audit') {

    this.selectedTab.set(tab);

    setTimeout(() => feather.replace(), 0);

  }

  // ==========================
  // ACCOUNT REQUESTS
  // (left as-is — pending supervisor decision)
  // ==========================

  loadPendingRequests(): void {

    this.administrationService.getPendingRequests().subscribe({

      next: data => {

        this.pendingRequests.set(data);

        setTimeout(() => feather.replace(), 0);

      },

      error: err => console.error(err)

    });

  }

  approveRequest(userId: string): void {

    this.administrationService.approveRequest(userId).subscribe({
      next: () => this.loadPendingRequests()
    });

  }

  rejectRequest(userId: string): void {

    this.administrationService.rejectRequest(userId).subscribe({
      next: () => this.loadPendingRequests()
    });

  }

  // ==========================
  // SETTINGS
  // ==========================

  loadSettings(): void {

    this.loadingSettings.set(true);

    this.administrationService.getSettings().subscribe({

      next: settings => {

        this.settings = settings;

        this.loadingSettings.set(false);

      },

      error: err => {

        console.error(err);

        this.loadingSettings.set(false);

      }

    });

  }

  saveSettings(): void {

    this.savingSettings.set(true);

    this.administrationService.saveSettings(this.settings).subscribe({

      next: () => {

        this.savingSettings.set(false);

        alert('Settings saved successfully');

      },

      error: err => {

        console.error(err);

        this.savingSettings.set(false);

        alert('Failed to save settings');

      }

    });

  }

  // ==========================
  // APPEARANCE
  // ==========================

  isDarkMode = computed(() => this.themeService.theme() === 'dark');

  toggleTheme(): void {

    this.themeService.toggle();

  }

  // ==========================
  // AUDIT LOG
  // ==========================

  filteredAuditLogs = computed(() => {

    const keyword = this.auditSearch().trim().toLowerCase();

    if (!keyword) {
      return this.auditLogs();
    }

    return this.auditLogs().filter(log =>
      (log.user ?? '').toLowerCase().includes(keyword) ||
      (log.action ?? '').toLowerCase().includes(keyword)
    );

  });

  loadAuditLogs(): void {

    this.loadingAudit.set(true);

    this.administrationService.getAuditLogs().subscribe({

      next: logs => {

        this.auditLogs.set(logs);

        this.loadingAudit.set(false);

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

        console.error(err);

        this.loadingAudit.set(false);

      }

    });

  }

  onAuditSearch(value: string): void {

    this.auditSearch.set(value);

  }

}