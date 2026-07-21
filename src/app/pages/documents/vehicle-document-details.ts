import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import feather from 'feather-icons';

import { VehicleDocumentService } from '../../services/vehicle-document.service';
import { VehicleDocument } from '../../models/vehicle-document';


@Component({
  selector: 'app-vehicle-document-details',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './vehicle-document-details.html',
  styleUrl: './vehicle-document-details.css'
})
export class VehicleDocumentDetails implements OnInit {


  document = signal<VehicleDocument | null>(null);


  loading = signal(false);



  constructor(

    private route: ActivatedRoute,

    private documentService: VehicleDocumentService,

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







  downloadDocument() {


    const doc =
      this.document();



    if (!doc) {
      return;
    }



    this.documentService
      .download(doc.id)
      .subscribe({

        next: response => {



          const blob =
            response.body;



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
        'Delete this vehicle document permanently?'
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