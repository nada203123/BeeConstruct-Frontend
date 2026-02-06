import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OffreService } from '../../../services/offres/offre.service';

@Component({
  selector: 'app-modify-offre',
  templateUrl: './modify-offre.component.html',
  styleUrl: './modify-offre.component.css'
})
export class ModifyOffreComponent implements OnInit{

 @Input() offre: any;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<void>();
  
  editOffreForm: FormGroup;
  
  errorMessage: string = '';
  clients: any[] = [];
  
  constructor(
    private fb: FormBuilder,
    private offreService: OffreService
  ) {
    this.editOffreForm = this.fb.group({
      titre: ['', Validators.required],
      localisation: ['', Validators.required],
      statutOffre: ['', Validators.required],
      clientId: ['', Validators.required],
      dateDemande: ['', Validators.required],
      type: ['', Validators.required],
    });
  }
  
  ngOnInit(): void {
    this.loadClients();
    this.populateForm();
  }
  
  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; 
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
  
  populateForm(): void {
    console.log('Current offer data:', this.offre);
    if (this.offre) {
      this.editOffreForm.patchValue({
        titre: this.offre.titre,
        localisation: this.offre.localisation,
        statutOffre: this.offre.statutOffre,
        clientId: this.offre.clientId,
        dateDemande: this.formatDate(this.offre.dateDemande),
        type: this.offre.type
      });
    }
  }
  
  
  onSubmit(): void {
    if (this.editOffreForm.invalid) {
      const formControls = this.editOffreForm.controls;
      const emptyFields = Object.keys(formControls)
        .filter(key => {
          const value = formControls[key].value;
          return !value || (typeof value === 'string' && value.trim() === '');
        });
    
      if (emptyFields.length > 0) {
        this.errorMessage = "Veuillez remplir tous les champs obligatoires.";
        return;
      }
      return;
    }
    
    
    const offreData = {
      id: this.offre.id,
      ...this.editOffreForm.value
    };
    
    this.offreService.updateOffre(offreData.id,offreData).subscribe({
      next: () => {
        this.update.emit();
        this.close.emit();
      },
      error: (err) => {
        console.log('Error:', err.error.message);
        if (err.status === 409) {
          this.errorMessage = err.error.message || 'Un conflit est survenu. Veuillez vérifier vos données.';
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
