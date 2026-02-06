import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeService } from '../../../services/employes/employe.service';

interface CountryCode {
  code: string;
  flag: string;
}

@Component({
  selector: 'app-add-employe',
  templateUrl: './add-employe.component.html',
  styleUrl: './add-employe.component.css'
})
export class AddEmployeComponent implements OnInit {
  @Input() employeType!: string;
  @Output() close = new EventEmitter<void>();
  @Output() employeAdded = new EventEmitter<void>();

  employeForm: FormGroup;
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
    this.employeForm = this.fb.group({});
  }

  ngOnInit(): void {
    if (this.employeType === 'interne') {
      this.employeForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        telephone: ['', Validators.required],
        adresse: ['', Validators.required],
        rib: ['', Validators.required],
        
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
    const phoneNumber = this.employeForm.get(field)?.value;
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
    const formControls = this.employeForm.controls;
    const requiredFields = Object.keys(formControls).filter(
      key => formControls[key].hasValidator(Validators.required) && (!formControls[key].value || formControls[key].value.trim() === '')
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
    

    let userData: any;
  

      userData = {
        firstName: this.employeForm.get('firstName')?.value,
        lastName: this.employeForm.get('lastName')?.value,
        telephone: `${this.selectedCountryCode.code}${this.employeForm.get('telephone')?.value}`,
        adresse: this.employeForm.get('adresse')?.value,
        rib: this.employeForm.get('rib')?.value,
        archived: false
      };
    

    this.employeService.addEmploye(userData).subscribe({
      next: () => {
        this.employeAdded.emit();
      },
      error: (err) => {
        console.log('Error:', err.error.message);
        console.log('Submitted Data:', userData);
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
    this.phoneFormatError = false;
  }
}