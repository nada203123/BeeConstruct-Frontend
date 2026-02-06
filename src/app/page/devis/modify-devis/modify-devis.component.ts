import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DevisService } from '../../../services/devis/devis.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-modify-devis',
  templateUrl: './modify-devis.component.html',
  styleUrls: ['./modify-devis.component.css']
})
export class ModifyDevisComponent implements OnInit {
  @Input() devis: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() devisUpdated = new EventEmitter<void>();

  devisForm: FormGroup;
  errorMessage: string = '';
  offres: any[] = [];
  selectedFile: File | null = null;
  selectedClientId: number | null = null;
  clientName: string = '';

  currentFileName: string = ''; // To display the existing file name
  isSubmitting = false;

  constructor(private fb: FormBuilder, private devisService: DevisService) {
    this.devisForm = this.fb.group({
      offreId: ['', Validators.required],
      clientId: [{ value: '', disabled: true }, Validators.required],
      fileName: ['']
    });
  }

  ngOnInit(): void {
    this.loadOffres();
   
  }

  loadOffres(): void {
    this.devisService.getAllActiveOffers().subscribe({
      next: (offres) => {
        this.offres = offres;
        console.log('liste des offres', this.offres);
        if (this.devis) {
          this.populateForm();
        }
      },
      error: (err) => {
        console.error('Error loading offres:', err);
        this.errorMessage = 'Impossible de charger la liste des offres.';
      }
    });
  }

  populateForm(): void {
    if (this.devis) {
      console.log("devis in modify", this.devis);
      this.currentFileName = this.devis.fileName || 'Aucun fichier';
      
      // Set the offer ID in the form
      this.devisForm.patchValue({
        offreId: this.devis.offerId
      });
      
      // Load client info for the selected offer
      this.devisService.getActiveOffersWithClient(this.devis.offerId).subscribe({
        next: (client) => {
          this.selectedClientId = client.id;
          this.clientName = `${client.nomSociete}`;
          this.devisForm.patchValue({
            clientId: this.clientName
          });
        },
        error: (err) => {
          console.error('Error loading client:', err);
          this.errorMessage = 'Impossible de charger les informations du client.';
        }
      });
    }
  }

  onOffreSelected(event: any): void {
    const offerId = Number(event.target.value);
   
    if (offerId) {
      this.devisService.getActiveOffersWithClient(offerId).subscribe({
        next: (client) => {
          this.selectedClientId = client.id;
          this.clientName = `${client.nomSociete}`;
          this.devisForm.patchValue({
            clientId: this.clientName
          });
        },
        error: (err) => {
          console.error('Error loading client:', err);
          this.errorMessage = 'Impossible de charger les informations du client.';
          this.selectedClientId = null;
          this.clientName = '';
          this.devisForm.patchValue({
            clientId: ''
          });
        }
      });
    } else {
      this.selectedClientId = null;
      this.clientName = '';
      this.devisForm.patchValue({
        clientId: ''
      });
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validExtensions.includes(fileExt)) {
        this.errorMessage = 'Seuls les documents PDF et Word (.pdf, .doc, .docx) sont autorisés';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      console.log(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.devisForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    const formData = new FormData();
    const offerId = this.devisForm.get('offreId')?.value;
    
    console.log("offerid in submit ", offerId)
    if (offerId) {
      formData.append('offerId', offerId.toString());
    }
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }
    console.log("form data", formData)

    this.devisService.updateDevis(this.devis.id, formData).subscribe({
      next: () => {
        this.devisUpdated.emit();
        this.close.emit();
      },
      error: (err) => {
        console.error('Error updating devis:', err);
        if (err.error && err.error.message) {
          this.errorMessage = "Veuillez sélectionner un fichier";
        } else if (err.status === 409) {
          this.errorMessage = 'Cette offre est déjà associée à un autre devis.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  closeModal(): void {
    this.errorMessage = '';
    this.close.emit();
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
  }
}