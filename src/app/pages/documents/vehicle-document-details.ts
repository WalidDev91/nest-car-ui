import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { VehicleDocumentService } from '../../services/vehicle-document.service';
import { VehicleDocument } from '../../models/vehicle-document';

@Component({
  selector: 'app-vehicle-document-details',
  imports: [CommonModule],
  templateUrl: './vehicle-document-details.html',
  styleUrl: './vehicle-document-details.css',
})
export class VehicleDocumentDetails implements OnInit {

  document = signal<VehicleDocument | null>(null);

  constructor(
    private route: ActivatedRoute,
    private documentService: VehicleDocumentService,
    private router: Router
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
