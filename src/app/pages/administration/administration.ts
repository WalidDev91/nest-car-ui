import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserRequestService } from '../../services/user-request.service';
import { ToastService } from '../../services/toast.service';

import { UserRequest } from '../../models/user-request';

import feather from 'feather-icons';

declare var bootstrap: any;

@Component({
  selector: 'app-administration',
  imports: [CommonModule, FormsModule],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration implements OnInit {

  // ==========================
  // TABS
  // ==========================

  selectedTab = signal<'requests'>('requests');
  // Settings tab removed — dark mode already lives in the navbar toggle,
  // and language switching was dropped (too large an i18n effort for now).
  // Audit tab intentionally left commented below for a future perspective.

  // ==========================
  // REQUESTS
  // ==========================

  requests = signal<UserRequest[]>([]);

  loadingRequests = signal(false);

  selectedRequest = signal<UserRequest | null>(null);

  reviewStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' = 'PENDING';

  reviewResponse = '';

  constructor(
    private userRequestService: UserRequestService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {

    this.loadRequests();

  }

  selectTab(tab: 'requests') {

    this.selectedTab.set(tab);

    setTimeout(() => feather.replace(), 0);

  }

  // ==========================
  // REQUESTS
  // ==========================

  loadRequests(): void {

    this.loadingRequests.set(true);

    this.userRequestService.getVisible().subscribe({

      next: requests => {

        this.requests.set(requests);

        this.loadingRequests.set(false);

        setTimeout(() => feather.replace(), 0);

      },

      error: err => {

        console.error(err);

        this.loadingRequests.set(false);

        this.toastService.error('Failed to load requests');

      }

    });

  }

  openReviewModal(request: UserRequest): void {

    this.selectedRequest.set(request);

    this.reviewStatus = request.status;

    this.reviewResponse = request.adminResponse ?? '';

    new bootstrap.Modal(document.getElementById('reviewRequestModal')).show();

  }

  submitReview(): void {

    const request = this.selectedRequest();

    if (!request) return;

    this.userRequestService.review(request.id, {
      status: this.reviewStatus,
      adminResponse: this.reviewResponse
    }).subscribe({

      next: () => {

        bootstrap.Modal.getInstance(document.getElementById('reviewRequestModal'))?.hide();

        this.selectedRequest.set(null);

        this.loadRequests();

        this.toastService.success('Request updated successfully');

      },

      error: err => {

        console.error(err);

        this.toastService.error('Failed to update request');

      }

    });

  }

  getStatusClass(status: string): string {

    switch (status) {
      case 'PENDING': return 'bg-warning text-dark';
      case 'IN_PROGRESS': return 'bg-info';
      case 'RESOLVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-secondary';
    }

  }

  // ==========================
  // AUDIT LOG — commented out for now, kept as a future perspective.
  // Uncomment the block below (and re-add 'audit' to selectedTab's type,
  // plus re-inject AdministrationService if the audit endpoint is restored)
  // to bring it back later.
  // ==========================

  // auditLogs = signal<AuditLog[]>([]);
  // auditSearch = signal('');
  // loadingAudit = signal(false);
  //
  // filteredAuditLogs = computed(() => {
  //   const keyword = this.auditSearch().trim().toLowerCase();
  //   if (!keyword) return this.auditLogs();
  //   return this.auditLogs().filter(log =>
  //     (log.user ?? '').toLowerCase().includes(keyword) ||
  //     (log.action ?? '').toLowerCase().includes(keyword)
  //   );
  // });
  //
  // loadAuditLogs(): void {
  //   this.loadingAudit.set(true);
  //   this.administrationService.getAuditLogs().subscribe({
  //     next: logs => {
  //       this.auditLogs.set(logs);
  //       this.loadingAudit.set(false);
  //       setTimeout(() => feather.replace(), 0);
  //     },
  //     error: err => {
  //       console.error(err);
  //       this.loadingAudit.set(false);
  //     }
  //   });
  // }
  //
  // onAuditSearch(value: string): void {
  //   this.auditSearch.set(value);
  // }

}