import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
interface CountryCode {
  code: string;
  flag: string;
  
}
@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {

  @Output() closeModal = new EventEmitter<void>();
  @Output() addUser = new EventEmitter<any>();

  userForm: FormGroup;
  selectedRole: string = 'Administrateur';
  errorMessage: string = '';
  users: any[] = [];
  usersToDisplay: any[] = []; 
  currentPage = 1;
  totalPages = 1;
  usersPerPage = 3;
  addFailed: boolean = false;
  showSuccessMessage = false;
  isSuccess: boolean = false;
  showPassword: boolean = false; 
  countryCodes: CountryCode[] = [
    {  code: '+33', flag: 'assets/images/france.png' },
    {  code: '+216', flag: 'assets/images/tunisie.png' }
  ];
  emailErrorFormat = false;
  passwordFormatError: boolean = false; 
  phoneFormatError: boolean = false;  

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required], 
      lastName: ['', Validators.required], 
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required], 
      password: ['', Validators.required],
    });
  }

  selectedCountryCode: CountryCode = this.countryCodes[0]; 
  isCountryCodeDropdownOpen = false;
  phoneErrorFormat: boolean = false;
  


  selectCountryCode(country: CountryCode): void {
    this.selectedCountryCode = country;
    this.isCountryCodeDropdownOpen = false;
  }

  toggleCountryCodeDropdown(): void {
    this.isCountryCodeDropdownOpen = !this.isCountryCodeDropdownOpen;
  }

  
  selectRole(role: string): void {
    this.selectedRole = role;
  }

  togglePasswordVisibility(): void { 
    this.showPassword = !this.showPassword;
  }

  loadUsersForPage(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.usersPerPage;
    const endIndex = startIndex + this.usersPerPage;
    this.usersToDisplay = this.users.slice(startIndex, endIndex);
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (data) => {
        this.users = data;
        this.totalPages = Math.ceil(this.users.length / this.usersPerPage);
        this.loadUsersForPage(this.currentPage);
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  validatePhoneNumber(): boolean {
    const phoneNumber = this.userForm.get('phoneNumber')?.value;
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
    const frenchRegex = /^[6|7][0-9]{8}$/;
    return frenchRegex.test(phone) && phone.length === 9;
  }

  handleAddUser(userData: any): void {
    
    this.addFailed = false;
    this.errorMessage = '';
    this.userService.addUser(userData).subscribe({
      next: (response) => {
        console.log('User added successfully:', response);
        this.addUser.emit(response);
    
        this.showSuccessMessage = true;
        this.errorMessage = ''; 
        this.addFailed = false;
        this.closeModal.emit(); 
        this.isSuccess = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 1500);
      },
      error: (error) => {
        console.error('Error adding user:', error);
       console.log("errrrr",error.error.error)
        if (error.status === 409) {
          if (error.error.error === 'Email already exists') {
            this.errorMessage = 'Cet e-mail est actuellement associé à un autre compte.';
           
          } else if (error.error.error === 'Phone number already exists') {
            this.errorMessage = 'Ce numéro de téléphone est actuellement associé à un autre compte.';
            
          }
        }else{
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
        
        this.addFailed = true;
      }
  });
  }
  onEmailChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const email = inputElement.value.trim();

    // Reset previous error states
    this.emailErrorFormat = false;
    this.errorMessage = '';

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      this.emailErrorFormat = true;
      this.errorMessage = 'Veuillez utiliser une adresse e-mail valide';
      return;
    }
  }
  onSubmit(): void {

    this.errorMessage = '';
    

    // Check if any field is empty
    const formControls = this.userForm.controls;
    const emptyFields = Object.keys(formControls).filter(
      key => !formControls[key].value || formControls[key].value.trim() === ''
    );
  
    if (emptyFields.length > 0) {
      this.errorMessage = "Veuillez remplir tous les champs.";
      return;
    } 

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const email = this.userForm.get('email')?.value;
    if (!emailRegex.test(email)) {
      this.emailErrorFormat = true;
      this.errorMessage = 'Veuillez utiliser une adresse e-mail valide';
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

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    const passwordControl = this.userForm.get('password')?.value;
    if (!passwordRegex.test(passwordControl)) {
      this.passwordFormatError = true;
      return;
    }
    
      const userData = {
        ...this.userForm.value,
        role: this.selectedRole ,
        phoneNumber: `${this.selectedCountryCode.code}${this.userForm.get('phoneNumber')!.value}`
      };
      console.log("userData",userData)
      this.handleAddUser(userData);
      this.loadUsers(); 
    
  }

  close(): void {
    this.closeModal.emit();
    this.loadUsers();
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
    this.passwordFormatError = false;
    this.emailErrorFormat = false;
    this.phoneFormatError = false;
  }
}