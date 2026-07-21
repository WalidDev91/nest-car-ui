import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import feather from 'feather-icons';

import { MissionDocumentService } from '../../services/mission-document.service';
import { MissionDocument } from '../../models/mission-document';


@Component({
  selector: 'app-mission-document-details',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './mission-document-details.html',
  styleUrl: './mission-document-details.css'
})
export class MissionDocumentDetails implements OnInit {


  document = signal<MissionDocument | null>(null);


  loading = signal(false);



  constructor(

    private route: ActivatedRoute,

    private documentService: MissionDocumentService,

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

            alert(
              'File is empty'
            );

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


          alert(
            'Download failed'
          );


        }


      });


  }







  deleteDocument() {


    const doc =
      this.document();



    if (!doc) {

      return;

    }



    const confirmed =
      confirm(
        'Delete this mission document permanently?'
      );



    if (!confirmed) {

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