import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DevisService } from '../../../services/devis/devis.service';

@Component({
  selector: 'app-add-devis',
  templateUrl: './add-devis.component.html',
  styleUrl: './add-devis.component.css'
})
export class AddDevisComponent implements OnInit {


  @Output() close = new EventEmitter<void>();
  @Output() devisAdded = new EventEmitter<void>();


       devisForm: FormGroup;
         
          errorMessage: string = '';
          offres: any[] = [];
          selectedFile: File | null = null;
          selectedClientId: number | null = null;
          clientName: string = '';
          isSubmitting = false;



            constructor(
                private fb: FormBuilder,
                private devisService: DevisService
              ) {
                this.devisForm = this.fb.group({
                  offreId: ['', Validators.required],
                  clientId: ['', [Validators.required, Validators.required]],
                  file: ['', Validators.required],
                  
                });
              }


              ngOnInit(): void {
                this.loadOffers();
              }
          
          
              loadOffers(): void {
                this.devisService.getAllActiveOffers().subscribe({
                  next: (offres) => {
                    this.offres = offres;
                    console.log("liste des offres" , this.offres)
                  },
                  error: (err) => {
                    console.error('Error loading offers:', err);
                    this.errorMessage = 'Impossible de charger la liste des clients.';
                  }
                });
              }

              onOfferSelected(event: any): void {
                const offerId = event.target.value;
                if (offerId) {
                  this.devisService.getActiveOffersWithClient(offerId).subscribe({
                    next: (client) => {
                      this.selectedClientId = client.id;
                      this.clientName = `${client.nomSociete}`;
                      console.log("client in devis", this.clientName)
                      this.devisForm.patchValue({
                        clientId: this.clientName
                      });
                    },
                    error: (err) => {
                      console.error('Error loading client:', err);
                      this.errorMessage = 'Impossible de charger les informations du client.';
                      this.selectedClientId = null;
                      this.clientName = '';
                    }
                  });
                } else {
                  this.selectedClientId = null;
                  this.clientName = '';
                  this.devisForm.patchValue({
                    clientId: ''
                  });
                }}


                onFileSelected(event: any): void {
                  const file: File = event.target.files[0];
                  if (file) {
                    // Validate file type
                    const validExtensions = ['.pdf', '.doc', '.docx'];
                    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                    
                    if (!validExtensions.includes(fileExt)) {
                      this.errorMessage = 'Seuls les documents PDF et Word (.pdf, .doc, .docx) sont autorisés';
                      this.selectedFile = null;
                      return;
                    }
              
                    this.selectedFile = file;
                    this.devisForm.patchValue({
                      file: file.name // Update form control for validation
                    });
                    console.log(this.selectedFile)
                  }
                }



                onSubmit(): void {
                  if (this.isSubmitting) {
                    return; // Prevent multiple submissions
                  }

                 
                 
                  console.log("formValid",this.devisForm.invalid)
                  console.log("selectedFile", this.selectedFile)
                  console.log("selectedClientId", this.selectedClientId)
                  if (this.devisForm.invalid || !this.selectedFile || !this.selectedClientId) {
                    this.errorMessage = 'Veuillez remplir tous les champs correctement.';
                    return;
                  }

                  this.isSubmitting = true;
                  this.errorMessage = '';
                  
              
                  const formData = new FormData();
                  const offerId = Number(this.devisForm.get('offreId')?.value);
                  formData.append('offerId', offerId.toString());
                  formData.append('file', this.selectedFile);
                  console.log("data",formData)
              
                  this.devisService.addDevis(formData).subscribe({
                    next: () => {
                      this.devisAdded.emit();
                      this.close.emit();
                      this.isSubmitting = false;
                    },
                    error: (err) => {
                      console.error('Error:', err);
                      if (err.error && err.error.message) {
                        this.errorMessage = err.error.message;
                      } else if (err.status === 409) {
                        this.errorMessage = 'Un devis existe déjà pour cette offre.';
                      } else {
                        this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
                      }
                    }
                  });
                }


              onClose(): void {
                this.close.emit();
              }
            
              clearErrorMessage(): void {
                this.errorMessage = '';
                
              }
                   
}
