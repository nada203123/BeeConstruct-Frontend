import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
interface CountryCode {
  code: string;
  flag: string;
  
}
@Component({
  selector: 'app-modify-user',
  templateUrl: './modify-user.component.html',
  styleUrls: ['./modify-user.component.css']
})
export class ModifyUserComponent implements OnInit {
  @Input() user: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<any>();

  editedUserForm: FormGroup;
  selectedRole: string = 'Administrateur';
  showPassword: boolean = false;

  users: any[] = [];
  usersToDisplay: any[] = [];
  currentPage = 1;
  totalPages = 1;
  usersPerPage = 3;
  countryCodes: CountryCode[] = [
    {  code: '+33', flag: 'assets/images/france.png' },
    {  code: '+216', flag: 'assets/images/tunisie.png' }
  ];

  

  errorMessage: string = '';
  emailErrorFormat = false;
  passwordFormatError: boolean = false; 
  selectedCountryCode: CountryCode = this.countryCodes[0]; // Default to first country
  isCountryCodeDropdownOpen = false;
  
  phoneFormatError: boolean = false; 
  emailExistsError: boolean = false;
  phoneExistsError: boolean = false;
  


  constructor(private fb: FormBuilder , private userService: UserService) {
    this.editedUserForm = this.fb.group({
      id: [''],
      role: ['', Validators.required],
      firstName: ['', Validators.required], 
      lastName: ['', Validators.required],  
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['']
    });
  }

  
  

  ngOnInit() {
    if (this.user) {

      const phoneNumber = this.user.phoneNumber || '';
      let localPhoneNumber = phoneNumber;

      for (const country of this.countryCodes) {
        if (phoneNumber.startsWith(country.code)) {
          this.selectedCountryCode = country;
          localPhoneNumber = phoneNumber.slice(country.code.length);
          break;
        }
      }

      this.editedUserForm.patchValue({
        id: this.user.id,
        role: this.user.role,
        firstName: this.user.firstName, 
        lastName: this.user.lastName,   
        email: this.user.email,
        phoneNumber: localPhoneNumber,
        password: ''
      });

      switch (this.user.role) {
        case 'Administrateur':
          this.selectedRole = 'Administrateur';
          break;
        case 'Chargé commercial':
          this.selectedRole = 'commercial';
          break;
        case 'Chargé de production':
          this.selectedRole = 'production';
          break;
        default:
          this.selectedRole = 'Administrateur'; 
      }
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (data) => {
        this.users = data;
        this.totalPages = this.users.length > this.usersPerPage ? Math.ceil(this.users.length / this.usersPerPage) : 1;
        if (this.currentPage > this.totalPages) {
          this.currentPage = 1;
        }
        this.loadUsersForPage(this.currentPage);
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  loadUsersForPage(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.usersPerPage;
    const endIndex = startIndex + this.usersPerPage;
    this.usersToDisplay = this.users.slice(startIndex, endIndex);
  }

  selectCountryCode(country: CountryCode): void {
    this.selectedCountryCode = country;
    this.isCountryCodeDropdownOpen = false;
  }

  toggleCountryCodeDropdown(): void {
    this.isCountryCodeDropdownOpen = !this.isCountryCodeDropdownOpen;
  }
  selectRole(role: string) {
    this.selectedRole = role;
    switch (role) {
      case 'Administrateur':
        this.editedUserForm.get('role')?.setValue('Administrateur');
        break;
      case 'commercial':
        this.editedUserForm.get('role')?.setValue('Chargé commercial');
        break;
      case 'production':
        this.editedUserForm.get('role')?.setValue('Chargé de production');
        break;
      default:
        this.editedUserForm.get('role')?.setValue('');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  validatePhoneNumber(): boolean {
    const phoneNumber = this. editedUserForm.get('phoneNumber')?.value;
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

  onSubmit() {

    this.errorMessage = '';
    this.emailExistsError = false;
    this.phoneExistsError = false;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const email = this.editedUserForm.get('email')?.value;
    if (!emailRegex.test(email)) {
      this.errorMessage = 'Veuillez utiliser une adresse e-mail valide';
      return;
    }
    
    
    
    const formControls = this.editedUserForm.controls;
    const emptyFields = Object.keys(formControls)
      .filter(key => {
        // Exclude password from empty field check
        if (key === 'password') return false;
        
        // Check if the field is empty or only contains whitespace
        return !formControls[key].value || 
               (typeof formControls[key].value === 'string' && formControls[key].value.trim() === '');
      });
  
    if (emptyFields.length > 0) {
      this.errorMessage = "Veuillez remplir tous les champs.";
      return;
    } 

    if (!this.validatePhoneNumber()) {
      const countryCode = this.selectedCountryCode.code;
      if (countryCode === '+216') {
        this.errorMessage = 'Numéro tunisien invalide.Le numéro doit commencer par 2 , 5 ,4  ou 9 et contenir 8 chiffres au total.';
      } else if (countryCode === '+33') {
        this.errorMessage = 'Numéro français invalide.Le numéro doit commencer par 6 ou 7 et contenir 9 chiffres au total.';
      }
      this.phoneFormatError = true;
      return;
    }

    const passwordControl = this.editedUserForm.get('password')?.value;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    
    if (passwordControl && passwordControl.trim() !== '') {
      if (!passwordRegex.test(passwordControl)) {
        this.passwordFormatError = true;
        return;
      }
    }

      const updatedUser = {
        ...this.editedUserForm.value,
        role: this.editedUserForm.get('role')?.value,
        phoneNumber: `${this.selectedCountryCode.code}${this.editedUserForm.get('phoneNumber')?.value}`,
        keycloakId: this.user.keycloakId 
      };

  

      this.userService.modifyUser(this.user.keycloakId, updatedUser).subscribe({
        next: (response) => {
          this.update.emit(updatedUser);
          //this.loadUsers;
          this.closeModal();
        },
        error: (error) => {
          console.log('Error updating user from modify modal:', error);
          console.log('Error updating user from modify modal:', error.error.message);
          if (error.status === 409) {
            if (error.error.message.toLowerCase().includes('email')) {
              this.errorMessage = 'Cet e-mail est actuellement associé à un autre compte.';
              this.emailExistsError = true;
            } else if (error.error.message.toLowerCase().includes('phone')) {
              this.errorMessage = 'Ce numéro de téléphone est actuellement associé à un autre compte.';
              this.phoneExistsError = true;
            } else {
              this.errorMessage = 'Une erreur de conflit est survenue lors de la mise à jour.';
            }
          } else {
            this.errorMessage = 'Une erreur est survenue lors de la mise à jour de l\'utilisateur.';
          }
        }
      });
    
  }

  closeModal() {
    this.close.emit();
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
    this.passwordFormatError = false;
    this.emailErrorFormat = false;
    this.phoneFormatError = false;
  }
}