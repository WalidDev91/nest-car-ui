import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import feather from 'feather-icons';

import { DriverDocumentService } from '../../services/driver-document.service';
import { DriverDocument } from '../../models/driver-document';


@Component({
  selector: 'app-driver-document-details',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './driver-document-details.html',
  styleUrl: './driver-document-details.css'
})
export class DriverDocumentDetails implements OnInit {


  document = signal<DriverDocument | null>(null);

  loading = signal(false);


  role =
    localStorage.getItem('role') ?? '';



  canValidate =
    [
      'FLEET_MANAGER',
      'ADMIN',
      'SUPER_ADMIN'
    ]
      .includes(this.role);



  isDriver =
    this.role === 'DRIVER';



  constructor(

    private route: ActivatedRoute,

    private documentService: DriverDocumentService,

    private router: Router

  ) { }



  ngOnInit(): void {

    this.loadDocument();

  }



  loadDocument() {


    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {
      return;
    }


    this.loading.set(true);



    this.documentService
      .getById(id)
      .subscribe({

        next: data => {

          this.document.set(data);

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




  approve() {


    const doc =
      this.document();



    if (!doc) {
      return;
    }



    this.documentService
      .updateStatus(
        doc.id,
        'APPROVED'
      )
      .subscribe({

        next: () => {

          this.loadDocument();

        },


        error: err => {

          console.error(err);

          alert(
            'Approval failed'
          );

        }

      });


  }





  reject() {


    const doc =
      this.document();



    if (!doc) {
      return;
    }



    this.documentService
      .updateStatus(
        doc.id,
        'REJECTED'
      )
      .subscribe({

        next: () => {

          this.loadDocument();

        },


        error: err => {

          console.error(err);

          alert(
            'Rejection failed'
          );

        }

      });


  }




  downloadDocument() {

    const doc = this.document();

    if (!doc) {
      return;
    }


    this.documentService
      .download(doc.id)
      .subscribe({

        next: response => {


          const blob = response.body;


          if (!blob) {

            alert('File is empty');

            return;

          }



          const url =
            window.URL.createObjectURL(blob);



          const link =
            document.createElement('a');



          link.href = url;



          link.download =
            doc.title;



          document.body.appendChild(link);



          link.click();



          link.remove();



          window.URL.revokeObjectURL(url);


        },


        error: err => {

          console.error(err);

          alert('Download failed');

        }

      });


  }




  deleteDocument() {


    const doc =
      this.document();



    if (!doc) {
      return;
    }



    if (
      !confirm(
        'Delete this document permanently?'
      )
    ) {
      return;
    }




    this.documentService
      .delete(doc.id)
      .subscribe({

        next: () => {

          alert(
            'Document deleted'
          );


          this.router.navigate([
            '/documents'
          ]);

        },


        error: err => {

          console.error(err);

          alert(
            'Delete failed'
          );

        }

      });


  }





  goBack() {

    this.router.navigate([
      '/documents'
    ]);

  }



}