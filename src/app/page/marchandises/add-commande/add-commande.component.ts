import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Commande } from '../../../models/commande.model';
import { Situation } from '../../../models/Situation.model';

@Component({
  selector: 'app-add-commande',
  templateUrl: './add-commande.component.html',
  styleUrls: ['./add-commande.component.css']
})
export class AddCommandeComponent {
  @Input() chantierId!: number;
  @Input() situations: Situation[] = [];
  @Input() isLoadingSituations: boolean = false;
  @Input() errorMessage: string | null = null; // From parent for backend errors
  @Output() close = new EventEmitter<void>();
  @Output() addCommande = new EventEmitter<Commande>();
  @Output() formValid = new EventEmitter<boolean>(); // New output for form validity

  commandeForm: FormGroup;
  tvaError: string | null = null;
  dateError: string | null = null;
  selectedMonth: Date | null = null;

  constructor(private fb: FormBuilder) {
    this.commandeForm = this.fb.group({
      nomFournisseur: ['', [Validators.required, Validators.minLength(2)]],
      prixHT: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,2})?$'), Validators.min(0.01)]],
      tva: ['', [Validators.required, Validators.pattern('^[0-9]{1,2}$'), Validators.min(5), Validators.max(20)]],
      dateCommande: [{ value: '', disabled: true }, Validators.required],
      description: [''],
      situationId: [null, Validators.required]
    });

    // TVA validation
    this.commandeForm.get('tva')?.valueChanges.subscribe(value => {
      const tvaValue = value ? parseFloat(value) : null;
      console.log('TVA value changed to:', value); // Log TVA change
      if (tvaValue !== null && (tvaValue < 5 || tvaValue > 20)) {
        this.tvaError = 'La TVA doit être entre 5 et 20.';
        this.commandeForm.get('tva')?.setErrors({ customError: true });
      } else {
        this.tvaError = null;
        this.commandeForm.get('tva')?.setErrors(null);
      }
      this.updateFormValidity();
    });

    // Update selected month when situation changes
    this.commandeForm.get('situationId')?.valueChanges.subscribe(situationId => {
      const dateControl = this.commandeForm.get('dateCommande');
      console.log('Situation ID changed to:', situationId, 'Type:', typeof situationId); // Log situation change and type
      if (situationId) {
        dateControl?.enable();
        console.log('Received situations in child:', this.situations); // Debug input data
        const selectedSituation = this.situations.find(s => s.id === +situationId); // Convert to number to match
        console.log('Selected situation:', selectedSituation); // Log the situation object
        if (selectedSituation?.dateSituation) {
          this.selectedMonth = new Date(selectedSituation.dateSituation);
          console.log('Selected month set to:', this.selectedMonth); // Log selected month
          this.validateDate(); // Revalidate date with new month
        } else {
          console.log('No dateSituation found for situation ID:', situationId); // Log if missing
          this.selectedMonth = null;
        }
      } else {
        dateControl?.disable();
        dateControl?.setValue('');
        this.selectedMonth = null;
        this.dateError = null;
        dateControl?.setErrors(null);
      }
      this.updateFormValidity();
    });

    // Validate date on change and errorMessage update
    this.commandeForm.get('dateCommande')?.valueChanges.subscribe(() => {
      console.log('Date changed to:', this.commandeForm.get('dateCommande')?.value); // Log date change
      this.validateDate();
      this.updateFormValidity();
    });
  }

  validateDate(): void {
    const dateControl = this.commandeForm.get('dateCommande');
    console.log('Validating date, control value:', dateControl?.value, 'selectedMonth:', this.selectedMonth); // Log validation start
    if (dateControl?.value && this.selectedMonth) {
      const selectedDate = new Date(dateControl.value);
      const situationMonth = this.selectedMonth.getMonth(); // 0-11 (e.g., 7 for August)
      const situationYear = this.selectedMonth.getFullYear();
      const selectedMonth = selectedDate.getMonth();
      const selectedYear = selectedDate.getFullYear();
      console.log('Comparing:', { situationMonth, situationYear, selectedMonth, selectedYear }); // Log comparison
      if (selectedMonth !== situationMonth || selectedYear !== situationYear) {
        this.dateError = 'La date doit être dans le même mois que la situation.';
        dateControl.setErrors({ mismatch: true });
        console.log('Date error set:', this.dateError); // Log error set
      } else {
        this.dateError = null;
        dateControl.setErrors(null);
        console.log('Date validated successfully'); // Log success
      }
    } else if (!dateControl?.value) {
      this.dateError = null;
      dateControl?.setErrors({ required: true });
      console.log('Date control empty, setting required error'); // Log empty state
    }
  }

  updateFormValidity(): void {
    const isValid = this.commandeForm.valid && !this.tvaError && !this.dateError && !this.errorMessage;
    console.log('Form validity updated to:', isValid, 'Details:', {
      formValid: this.commandeForm.valid,
      tvaError: this.tvaError,
      dateError: this.dateError,
      errorMessage: this.errorMessage
    }); // Log validity state
    this.formValid.emit(isValid);
  }

  onSubmit(): void {
    console.log('Submitting form, current state:', this.commandeForm.value); // Log submission state
    this.validateDate(); // Validate date before submission
    this.updateFormValidity();
    if (this.commandeForm.invalid || this.tvaError || this.errorMessage) {
      console.log('Submission failed due to:', this.tvaError || this.dateError || this.errorMessage || 'Veuillez remplir tous les champs obligatoires correctement.');
      this.commandeForm.markAllAsTouched();
      return;
    }

    const newCommande: Commande = {
      nomFournisseur: this.commandeForm.get('nomFournisseur')?.value,
      prixHT: parseFloat(this.commandeForm.get('prixHT')?.value || '0'),
      tva: parseInt(this.commandeForm.get('tva')?.value || '0', 10),
      dateCommande: this.commandeForm.get('dateCommande')?.value,
      description: this.commandeForm.get('description')?.value || '',
      chantierId: this.chantierId,
      situationId: this.commandeForm.get('situationId')?.value
    };

    // Validate parsed values
    if (isNaN(newCommande.prixHT) || newCommande.prixHT < 0.01) {
      this.commandeForm.get('prixHT')?.setErrors({ invalid: true });
      return;
    }
    if (isNaN(newCommande.tva) || newCommande.tva < 5 || newCommande.tva > 20) {
      this.commandeForm.get('tva')?.setErrors({ invalid: true });
      return;
    }

    console.log('Sending commande:', newCommande);
    this.addCommande.emit(newCommande);
  }

  onClose(): void {
    this.close.emit();
    this.commandeForm.reset();
    this.tvaError = null;
    this.dateError = null;
    this.errorMessage = null;
    this.commandeForm.get('dateCommande')?.disable();
    this.selectedMonth = null;
    this.updateFormValidity();
  }

  clearErrorMessage(): void {
    this.tvaError = null;
    this.dateError = null;
    this.commandeForm.get('tva')?.setErrors(null);
    this.commandeForm.get('dateCommande')?.setErrors(null);
    this.updateFormValidity();
  }
}