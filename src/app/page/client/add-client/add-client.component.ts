import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../../services/client.service';

interface CountryCode {
  code: string;
  flag: string;
}

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrl: './add-client.component.css'
})
export class AddClientComponent {

  @Output() close = new EventEmitter<void>();
  @Output() clientAdded = new EventEmitter<void>();

  clientForm: FormGroup;
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
    this.clientForm = this.fb.group({
      nomSociete: ['', Validators.required],
      siegeSocial: ['', Validators.required],
      adresse: [''],  
      directeurComplet: ['', Validators.required],
      telephoneDirecteur: ['',Validators.required]   
    });
  }

  selectCountryCode(country: CountryCode): void {
    this.selectedCountryCode = country;
    this.isCountryCodeDropdownOpen = false;
  }

  toggleCountryCodeDropdown(): void {
    this.isCountryCodeDropdownOpen = !this.isCountryCodeDropdownOpen;
  }

  validatePhoneNumber(): boolean {
    const phoneNumber = this.clientForm.get('telephone')?.value;
    
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
    const formControls = this.clientForm.controls;
    const requiredFields = ['nomSociete', 'siegeSocial', 'directeurComplet','telephoneDirecteur'];
    
    const emptyRequiredFields = requiredFields.filter(
      key => !formControls[key].value || formControls[key].value.trim() === ''
    );
  
    if (emptyRequiredFields.length > 0) {
      this.errorMessage = "Veuillez remplir tous les champs obligatoires.";
      return;
    } 

    // Only validate phone if it's been entered
    if (this.clientForm.get('telephoneDirecteur')?.value && !this.validatePhoneNumber()) {
      const countryCode = this.selectedCountryCode.code;
      if (countryCode === '+216') {
        this.errorMessage = 'Numéro tunisien invalide. Le numéro doit commencer par 2, 5, 4 ou 9 et contenir 8 chiffres au total.';
      } else if (countryCode === '+33') {
        this.errorMessage = 'Numéro français invalide. Le numéro doit commencer par 6 ou 7 et contenir 9 chiffres au total.';
      }
      this.phoneFormatError = true;
      return;
    }

    // Prepare the data to be sent
    const directeurNomComplet = this.clientForm.value.directeurComplet.trim();
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
      nomSociete: this.clientForm.value.nomSociete,
      siegeSocial: this.clientForm.value.siegeSocial,
      nomDirecteur: nomDirecteur,
      prenomDirecteur: prenomDirecteur
    };
    
    if (this.clientForm.value.adresse && this.clientForm.value.adresse.trim() !== '') {
      clientData.adresse = this.clientForm.value.adresse;
    }
    
    // Only add telephone if it has a value
    if (this.clientForm.value.telephoneDirecteur) {
      clientData.telephoneDirecteur = `${this.selectedCountryCode.code}${this.clientForm.value.telephoneDirecteur}`;
    }
   
    this.clientService.addClient(clientData).subscribe({
      next: () => {
        this.clientAdded.emit();
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

  onClose(): void {
    this.close.emit();
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
    this.phoneFormatError = false;
  }
}