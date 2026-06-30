import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DriverDocumentService } from '../../services/driver-document.service';
import { DriverDocument } from '../../models/driver-document';

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
    private documentService: DriverDocumentService
  ) {}

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
}
