import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../../services/client.service';

interface CountryCode {
  code: string;
  flag: string;
}

@Component({
  selector: 'app-modify-client',
  templateUrl: './modify-client.component.html',
  styleUrl: './modify-client.component.css'
})
export class ModifyClientComponent implements OnInit {
  @Input() client: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<any>();

  editedClientForm: FormGroup;
  countryCodes: CountryCode[] = [
    { code: '+33', flag: 'assets/images/france.png' },
    { code: '+216', flag: 'assets/images/tunisie.png' }
  ];
  selectedCountryCode: CountryCode = this.countryCodes[0]; 
  isCountryCodeDropdownOpen = false;
  phoneFormatError: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService
  ) {
    this.editedClientForm = this.fb.group({
      id: [''],
      societe: ['', Validators.required],
      siegeSocial: ['', Validators.required],
      adresse: [''],
      directeurExploitation: ['', Validators.required],
      telephone: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.client) {
      const phoneNumber = this.client.telephoneDirecteur || '';
      let localPhoneNumber = phoneNumber;

      // Extract country code from phone number
      for (const country of this.countryCodes) {
        if (phoneNumber.startsWith(country.code)) {
          this.selectedCountryCode = country;
          localPhoneNumber = phoneNumber.slice(country.code.length);
          break;
        }
      }

      this.editedClientForm.patchValue({
        id: this.client.id,
        societe: this.client.nomSociete,
        siegeSocial: this.client.siegeSocial,
        adresse: this.client.adresse,
        directeurExploitation: `${this.client.nomDirecteur} ${this.client.prenomDirecteur}`,
        telephone: localPhoneNumber
      });
    }
  }

  selectCountryCode(country: CountryCode): void {
    this.selectedCountryCode = country;
    this.isCountryCodeDropdownOpen = false;
  }

  toggleCountryCodeDropdown(): void {
    this.isCountryCodeDropdownOpen = !this.isCountryCodeDropdownOpen;
  }

  validatePhoneNumber(): boolean {
    const phoneNumber = this.editedClientForm.get('telephone')?.value;
    
    // If phone is empty and not required, bypass validation
    if (!phoneNumber || phoneNumber.trim() === '') {
      return true;
    }
    
    const countryCode = this.selectedCountryCode.code;
  
    // Remove any non-digit characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');
  
    if (countryCode === '+216') { // Tunisia
      return this.validateTunisianPhone(cleanPhone);
    } else if (countryCode === '+33') { // France
      return this.validateFrenchPhone(cleanPhone);
    }
  
    return false;
  }

  validateTunisianPhone(phone: string): boolean {
    const tunisianRegex = /^(2|5|9|7|4)[0-9]{7}$/;
    return tunisianRegex.test(phone);
  }
  
  validateFrenchPhone(phone: string): boolean {
    const frenchRegex = /^[1-9][0-9]{8}$/;
    return frenchRegex.test(phone) && phone.length === 9;
  }

  onSubmit(): void {
    const formControls = this.editedClientForm.controls;
    const requiredFields = ['societe', 'siegeSocial', 'directeurExploitation','telephone'];
    
    const emptyRequiredFields = requiredFields.filter(
      key => !formControls[key].value || formControls[key].value.trim() === ''
    );
  
    if (emptyRequiredFields.length > 0) {
      this.errorMessage = "Veuillez remplir tous les champs obligatoires.";
      return;
    } 

    // Only validate phone if it's been entered
    if (this.editedClientForm.get('telephone')?.value && !this.validatePhoneNumber()) {
      const countryCode = this.selectedCountryCode.code;
      if (countryCode === '+216') {
        this.errorMessage = 'Numéro tunisien invalide. Le numéro doit commencer par 2, 5, 4 ou 9 et contenir 8 chiffres au total.';
      } else if (countryCode === '+33') {
        this.errorMessage = 'Numéro français invalide. Le numéro doit commencer par 6 ou 7 et contenir 9 chiffres au total.';
      }
      this.phoneFormatError = true;
      return;
    }


    const directeurNomComplet = this.editedClientForm.value.directeurExploitation.trim();
    const nomPrenom = directeurNomComplet.split(' ');
    
    let nomDirecteur = '';
    let prenomDirecteur = '';
    
    // Handle different formats of name entry (with varying number of spaces)
    if (nomPrenom.length >= 2) {
      // Assume the last word is the last name, everything else is first name
      nomDirecteur = nomPrenom[nomPrenom.length - 1];
      prenomDirecteur = nomPrenom.slice(0, nomPrenom.length - 1).join(' ');
    } else if (nomPrenom.length === 1) {
      // If only one word, use it as both first and last name 
      // (this is a fallback, user should be instructed to provide full name)
      nomDirecteur = nomPrenom[0];
      prenomDirecteur = nomPrenom[0];
    }


    const clientData: any = {
      id: this.editedClientForm.value.id,
      nomSociete: this.editedClientForm.value.societe,
      siegeSocial: this.editedClientForm.value.siegeSocial,
      nomDirecteur: nomDirecteur,
      prenomDirecteur: prenomDirecteur
    };
    
    if (this.editedClientForm.value.adresse && this.editedClientForm.value.adresse.trim() !== '') {
      clientData.adresse = this.editedClientForm.value.adresse;
    }
    
    // Only add telephone if it has a value
    if (this.editedClientForm.value.telephone) {
      clientData.telephoneDirecteur = `${this.selectedCountryCode.code}${this.editedClientForm.value.telephone}`;
    }
   console.log("client data " ,clientData )
   
    this.clientService.updateClient(clientData.id, clientData).subscribe({
      next: () => {
        this.update.emit(clientData);
      },
      error: (err) => {
        console.log('Error :', err.error.message);
        if (err.status === 409) {
          this.errorMessage = err.error.message || 'Un conflit est survenu. Veuillez vérifier vos données.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
    this.phoneFormatError = false;
  }
}