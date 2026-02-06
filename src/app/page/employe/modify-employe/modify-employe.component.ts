import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeService } from '../../../services/employes/employe.service';

interface CountryCode {
  code: string;
  flag: string;
}

interface UpdateEmployePayload {
  firstName: string | null;
  lastName: string | null;
  telephone: string | null;
  adresse: string | null;
  rib: string | null;

  
}

@Component({
  selector: 'app-modify-employe',
  templateUrl: './modify-employe.component.html',
  styleUrl: './modify-employe.component.css'
})
export class ModifyEmployeComponent implements OnInit {
  @Input() employe: any = null;
  @Input() employeType!: string;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<any>();

  editedEmployeForm: FormGroup;
  countryCodes: CountryCode[] = [
    { code: '+33', flag: 'assets/images/france.png' },
    { code: '+216', flag: 'assets/images/tunisie.png' }
  ];
  selectedCountryCode: CountryCode = this.countryCodes[0];
  selectedCountryCodeRep: CountryCode = this.countryCodes[0];
  isCountryCodeDropdownOpen = false;
  isCountryCodeRepDropdownOpen = false;
  phoneFormatError: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private employeService: EmployeService
  ) {
    this.editedEmployeForm = this.fb.group({});
  }

  ngOnInit(): void {
   
      this.editedEmployeForm = this.fb.group({
        id: [''],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        telephone: ['', Validators.required],
        adresse: ['', Validators.required],
        rib: ['', Validators.required],
       
      });
    
    
    if (this.employe) {
      
        const phoneNumber = this.employe.telephone || '';
        let localPhoneNumber = phoneNumber;

        for (const country of this.countryCodes) {
          if (phoneNumber.startsWith(country.code)) {
            this.selectedCountryCode = country;
            localPhoneNumber = phoneNumber.slice(country.code.length);
            break;
          }
        }

        const formType = this.employe.type === 'PER_DIEM' ? 'par diem' : 'forfait';

        this.editedEmployeForm.patchValue({
          id: this.employe.id,
          firstName: this.employe.firstName,
          lastName: this.employe.lastName,
          telephone: localPhoneNumber,
          adresse: this.employe.adresse || '',
          rib: this.employe.rib || '',
          type: formType
        });
      
    }
  }

  selectCountryCode(country: CountryCode, isRep: boolean = false): void {
    if (isRep) {
      this.selectedCountryCodeRep = country;
      this.isCountryCodeRepDropdownOpen = false;
    } else {
      this.selectedCountryCode = country;
      this.isCountryCodeDropdownOpen = false;
    }
  }

  toggleCountryCodeDropdown(isRep: boolean = false): void {
    if (isRep) {
      this.isCountryCodeRepDropdownOpen = !this.isCountryCodeRepDropdownOpen;
    } else {
      this.isCountryCodeDropdownOpen = !this.isCountryCodeDropdownOpen;
    }
  }

  validatePhoneNumber(field: string = 'telephone'): boolean {
    const phoneNumber = this.editedEmployeForm.get(field)?.value;
    if (!phoneNumber) return false; // Fail validation if mandatory field is empty
    const countryCode = field === 'telephoneRepresentant' ? this.selectedCountryCodeRep.code : this.selectedCountryCode.code;

    const cleanPhone = phoneNumber.replace(/\D/g, '') || '';

    if (countryCode === '+216') {
      return this.validateTunisianPhone(cleanPhone);
    } else if (countryCode === '+33') {
      return this.validateFrenchPhone(cleanPhone);
    }

    return false;
  }

  validateTunisianPhone(phone: string): boolean {
    const tunisianRegex = /^(2|5|9|7|4)[0-9]{7}$/;
    return tunisianRegex.test(phone);
  }

  validateFrenchPhone(phone: string): boolean {
    const frenchRegex = /^[6-7][0-9]{8}$/;
    return frenchRegex.test(phone) && phone.length === 9;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.phoneFormatError = false;

    const formControls = this.editedEmployeForm.controls;
    const requiredFields = Object.keys(formControls).filter(
      key => formControls[key].hasValidator(Validators.required) && (!formControls[key].value || String(formControls[key].value).trim() === '')
    );

    if (requiredFields.length > 0) {
      this.errorMessage = "Veuillez remplir tous les champs obligatoires.";
      return;
    }

   
      if (!this.validatePhoneNumber('telephone')) {
        const countryCode = this.selectedCountryCode.code;
        if (countryCode === '+216') {
          this.errorMessage = 'Numéro tunisien invalide. Le numéro doit commencer par 2, 5, 4 ou 9 et contenir 8 chiffres au total.';
        } else if (countryCode === '+33') {
          this.errorMessage = 'Numéro français invalide. Le numéro doit commencer par 6 ou 7  et contenir 9 chiffres au total.';
        }
        this.phoneFormatError = true;
        return;
      }
    

    const updatedEmploye: UpdateEmployePayload = {
      firstName: this.editedEmployeForm.get('firstName')?.value ,
      lastName:  this.editedEmployeForm.get('lastName')?.value ,
      telephone: `${this.selectedCountryCode.code}${this.editedEmployeForm.get('telephone')?.value}` ,
      adresse: this.editedEmployeForm.get('adresse')?.value,
      rib: this.editedEmployeForm.get('rib')?.value ,
 
    };

    
    

    const employeId = this.editedEmployeForm.get('id')?.value;
    this.employeService.updateEmploye(employeId, updatedEmploye).subscribe({
      next: () => {
        this.update.emit(updatedEmploye);
      },
      error: (err) => {
        console.log('Error:', err.error.message);
        console.log('Submitted Data:', updatedEmploye);
        if (err.status === 409) {
          this.errorMessage = err.error.message || 'Un conflit est survenu. Veuillez vérifier vos données.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
    this.phoneFormatError = false;
  }

  closeModal(): void {
    this.errorMessage = '';
    this.close.emit();
  }
}