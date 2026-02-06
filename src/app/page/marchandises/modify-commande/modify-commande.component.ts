import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Commande } from '../../../models/commande.model';
import { SituationService } from '../../../services/situation/situation.service';
import { Situation } from '../../../models/Situation.model';

@Component({
  selector: 'app-modify-commande',
  templateUrl: './modify-commande.component.html',
  styleUrls: ['./modify-commande.component.css']
})
export class ModifyCommandeComponent implements OnInit {
  @Input() commande!: Commande;
  @Output() close = new EventEmitter<void>();
  @Output() updateCommande = new EventEmitter<Commande>();
  @Input() situations: Situation[] = [];

  commandeForm: FormGroup;
  errorMessage: string | null = null;
  tvaError: string | null = null;
  dateError: string | null = null;
  selectedMonth: Date | null = null;

  constructor(
    private fb: FormBuilder,
    private situationService: SituationService // Inject SituationService to fetch situation data
  ) {
   this.commandeForm = this.fb.group({
  nomFournisseur: ['', [Validators.required, Validators.minLength(2)]],
  prixHT: [null, [Validators.required, Validators.min(0.01)]],
  tva: [null, [Validators.required, Validators.min(5), Validators.max(20)]],
  dateCommande: ['', Validators.required],
  description: ['', [Validators.required, Validators.minLength(5)]],
  situationId: [null, Validators.required] // Add situationId with validation
});


    // TVA validation
    this.commandeForm.get('tva')?.valueChanges.subscribe(value => {
      if (value !== null && (value < 5 || value > 20)) {
        this.tvaError = 'La TVA doit être entre 5 et 20.';
      } else {
        this.tvaError = null;
      }
    });

    // Date validation
    this.commandeForm.get('dateCommande')?.valueChanges.subscribe(() => {
      this.validateDate();
    });

    this.commandeForm.get('situationId')?.valueChanges.subscribe(value => {
  // At this point, value is the selected situation id number
  // You can handle side effects like updating selectedMonth for validation here if required
  const situation = this.situations.find(s => s.id === value);
  if (situation) {
    this.selectedMonth = new Date(situation.dateSituation);
    this.validateDate();
  }
});

  }

  ngOnInit(): void {
    if (this.commande) {
      this.commandeForm.patchValue({
    nomFournisseur: this.commande.nomFournisseur,
    prixHT: this.commande.prixHT,
    tva: this.commande.tva,
    dateCommande: this.commande.dateCommande,
    description: this.commande.description,
  situationId: this.commande.situationId as number // Patch situationId here
  });

      // Fetch the situation to get the dateSituation based on situationId
      if (this.commande.situationId) {
        this.situationService.getSituationById(this.commande.situationId).subscribe({
          next: (situation: Situation) => {
            this.selectedMonth = new Date(situation.dateSituation);
            this.validateDate(); // Validate the initial date against the situation
          },
          error: (err) => {
            console.error('Failed to load situation for date validation:', err);
            this.selectedMonth = null;
          }
        });
      }
    }
  }

  validateDate(): void {
    const dateControl = this.commandeForm.get('dateCommande');
    if (dateControl?.value && this.selectedMonth) {
      const selectedDate = new Date(dateControl.value);
      const situationMonth = this.selectedMonth.getMonth(); // 0-11 (e.g., 7 for August)
      const situationYear = this.selectedMonth.getFullYear();
      const selectedMonth = selectedDate.getMonth();
      const selectedYear = selectedDate.getFullYear();
      if (selectedMonth !== situationMonth || selectedYear !== situationYear) {
        this.dateError = 'La date doit être dans le même mois que la situation.';
        dateControl.setErrors({ mismatch: true });
      } else {
        this.dateError = null;
        dateControl.setErrors(null);
      }
    } else if (!dateControl?.value) {
      this.dateError = null;
      dateControl?.setErrors({ required: true });
    }
  }

  onSubmit(): void {
    if (this.commandeForm.invalid || this.tvaError || this.dateError) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement.';
      this.commandeForm.markAllAsTouched();
      return;
    }

    const updatedCommande: Commande = {
      ...this.commande,
      nomFournisseur: this.commandeForm.get('nomFournisseur')?.value,
      prixHT: this.commandeForm.get('prixHT')?.value,
      tva: this.commandeForm.get('tva')?.value,
      dateCommande: this.commandeForm.get('dateCommande')?.value,
      description: this.commandeForm.get('description')?.value,
      situationId: this.commandeForm.get('situationId')?.value
    };

    

    this.updateCommande.emit(updatedCommande);
    this.onClose();
  }

  onClose(): void {
    this.close.emit();
    this.commandeForm.reset();
    this.errorMessage = null;
    this.tvaError = null;
    this.dateError = null;
  }

  clearErrorMessage(): void {
    this.errorMessage = null;
  }
}