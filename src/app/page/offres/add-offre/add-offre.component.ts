import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OffreService } from '../../../services/offres/offre.service';

@Component({
  selector: 'app-add-offre',
  templateUrl: './add-offre.component.html',
  styleUrl: './add-offre.component.css'
})
export class AddOffreComponent implements OnInit {

   @Output() close = new EventEmitter<void>();
    @Output() offreAdded = new EventEmitter<void>();
  
    offreForm: FormGroup;
   
    errorMessage: string = '';
    clients: any[] = [];
    statutDisplay = "En attente de devis";
    
  
    constructor(
      private fb: FormBuilder,
      private offreService: OffreService
    ) {
      this.offreForm = this.fb.group({
        titre: ['', Validators.required],
        localisation: ['', Validators.required],
        statutOffre: [{ value: 'EN_ATTENTE_DE_DEVIS', disabled: false }],
        clientId: ['', [Validators.required, Validators.required]],
        dateDemande: ['', Validators.required],
        type: ['', Validators.required],
        
      });
    }

    ngOnInit(): void {
      this.loadClients();
    }


    loadClients(): void {
      this.offreService.getAllActiveClients().subscribe({
        next: (clients) => {
          this.clients = clients;
        },
        error: (err) => {
          console.error('Error loading clients:', err);
          this.errorMessage = 'Impossible de charger la liste des clients.';
        }
      });
    }
  
  
    onSubmit(): void {
  
      const formControls = this.offreForm.controls;
      const emptyFields = Object.keys(formControls)
      .filter(key => key !== 'statut')
      .filter(key => !formControls[key].value || formControls[key].value.trim() === '');
      if (emptyFields.length > 0) {
        this.errorMessage = "Veuillez remplir tous les champs.";
        return;
      } 
  
    
  
      
  
      const offreData = {
        ...this.offreForm.value
      };
     
        this.offreService.createOffre(offreData).subscribe({
          next: () => {
            console.log("offre",offreData)
            this.offreAdded.emit();
            this.close.emit();
            
          },
          error: (err) => {
            console.log('Error :', err.error.message);
            console.log(this.offreForm.value)
            if (err.status === 409) {
              this.errorMessage = err.error.message || 'A conflict occurred. Please check your data.';
            } else {
              this.errorMessage = 'An error occurred. Please try again.';
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
