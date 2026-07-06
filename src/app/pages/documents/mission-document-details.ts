import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MissionDocumentService } from '../../services/mission-document.service';
import { MissionDocument } from '../../models/mission-document';

@Component({
  selector: 'app-mission-document-details',
  imports: [CommonModule],
  templateUrl: './mission-document-details.html',
  styleUrl: './mission-document-details.css',
})
export class MissionDocumentDetails implements OnInit {

  document = signal<MissionDocument | null>(null);

  constructor(
    private route: ActivatedRoute,
    private documentService: MissionDocumentService,
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
