import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DriverDocumentService } from '../../services/driver-document.service';
import { DriverDocument } from '../../models/driver-document';
import { Router } from '@angular/router';

@Component({
  selector: 'app-driver-document-details',
  imports: [CommonModule],
  templateUrl: './driver-document-details.html',
  styleUrl: './driver-document-details.css',
})
export class DriverDocumentDetails implements OnInit {

  document = signal<DriverDocument | null>(null);

  constructor(
    private route: ActivatedRoute,
    private documentService: DriverDocumentService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.documentService.getById(id).subscribe({
        next: (data) => {
          this.document.set(data);
        },
        error: (err) => {
          console.error('Failed to load document:', err);
        }
      });
    }
  }


  approve() {

    const doc = this.document();

    if (!doc) return;

    this.documentService.updateStatus(doc.id, 'APPROVED')
      .subscribe({
        next: () => {
          this.router.navigate(['/documents']);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  reject() {

    const doc = this.document();

    if (!doc) return;

    this.documentService.updateStatus(doc.id, 'REJECTED')
      .subscribe({
        next: () => {
          this.router.navigate(['/documents']);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  deleteDocument() {

    const doc = this.document();

    if (!doc) {
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to delete this document?'
    );

    if (!confirmed) {
      return;
    }

    this.documentService.delete(doc.id).subscribe({
      next: () => {
        alert('Document deleted');

        this.router.navigate(['/documents']);
      },
      error: (err) => {
        console.error(err);
        alert('Delete failed');
      }
    });
  }
}