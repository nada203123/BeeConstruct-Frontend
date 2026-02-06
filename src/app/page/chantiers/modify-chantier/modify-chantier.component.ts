import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChantierService } from '../../../services/chantier/chantier.service';
import { Chantier } from '../chantiers.component';

@Component({
  selector: 'app-modify-chantier',
  templateUrl: './modify-chantier.component.html',
  styleUrls: ['./modify-chantier.component.css']
})
export class ModifyChantierComponent implements OnInit {
  @Input() chantierId: number | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() chantierUpdated = new EventEmitter<void>();
  editedChantierForm: FormGroup;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private chantierService: ChantierService) {
    this.editedChantierForm = this.fb.group({
      titre: [{ value: '', disabled: true }],
      localisation: [{ value: '', disabled: true }],
      client: [{ value: '', disabled: true }],
      coutTotal: ['', [Validators.required, Validators.min(0)]],
      dateDeDebut: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.chantierId) {
      this.chantierService.getChantierById(this.chantierId).subscribe({
        next: (chantier: any) => {
          const formattedDate = this.formatDateWithoutTimezoneShift(chantier.dateDeDebut);
          this.editedChantierForm.patchValue({
            titre: chantier.titre || '-',
            localisation: chantier.localisation || '-',
            client: chantier.client || '-',
            coutTotal: chantier.coutTotal || 0,
            dateDeDebut:  formattedDate || ''
          });
        },
        error: () => {
          this.errorMessage = 'Erreur lors du chargement des données du chantier.';
        }
      });
    }
  }

  private formatDateWithoutTimezoneShift(dateStr: string): string {
    // Parse the date string directly without timezone conversion
    if (!dateStr) return '';
    
    // Extract the date part only (YYYY-MM-DD)
    const parts = dateStr.split('T');
    if (parts.length > 0) {
      return parts[0]; // Return just the date part
    }
    return '';
  }

  onSubmit(): void {

   const coutTotalControl = this.editedChantierForm.get('coutTotal');
  const coutTotalRawValue = coutTotalControl?.value;
  const dateDeDebutValue = this.editedChantierForm.get('dateDeDebut')?.value;

    if (!this.editedChantierForm.get('coutTotal')?.value || !this.editedChantierForm.get('dateDeDebut')?.value) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

     if (isNaN(coutTotalRawValue) || !/^\d+(\.\d{1,2})?$/.test(coutTotalRawValue)) {
    this.errorMessage = 'Le coût total doit être un nombre valide.';
    return;
  }

  const coutTotalValue = Number(coutTotalRawValue);

  // Vérifie que coutTotal n'est pas négatif
  if (coutTotalValue < 0) {
    this.errorMessage = 'Le coût total ne peut pas être négatif.';
    return;
  }


    
    if (this.editedChantierForm.valid && this.chantierId) {
      const formDate = this.editedChantierForm.get('dateDeDebut')?.value;
      const updatedChantier = {
        titre: this.editedChantierForm.get('titre')?.value || '',
        localisation: this.editedChantierForm.get('localisation')?.value || '',
        clientId: 0, // Placeholder, update if you have clientId logic
        client: this.editedChantierForm.get('client')?.value || '',
        coutTotal: Number(this.editedChantierForm.get('coutTotal')?.value),
        dateDeDebut: `${formDate}T00:00:00`
      };
      console.log('Sending update request:', updatedChantier);
      this.chantierService.updateChantier(this.chantierId, updatedChantier).subscribe({
        next: () => {
          this.chantierUpdated.emit();
          this.close.emit();
        },
        error: (err) => {
          console.log("console the error",err.error.message)
          console.error('Update error:', err);
          this.errorMessage = err.error.message;
        }
      });
    }
  }

  closeModal(): void {
    this.errorMessage = '';
    this.close.emit();
  }
 

  clearErrorMessage(): void {
    this.errorMessage = null;
  }
}