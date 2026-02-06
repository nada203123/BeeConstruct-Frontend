import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { profile } from 'node:console';
import { catchError, throwError } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environment/environment';
interface CountryCode {
  code: string;
  flag: string;
  
}
@Component({
  selector: 'app-modify-profile',
  templateUrl: './modify-profile.component.html',
  styleUrls: ['./modify-profile.component.css']
})
export class ModifyProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  private apiUrl = environment.apiUrlUser;
  profileForm!: FormGroup; 
  selectedProfilePicture: SafeUrl = 'assets/images/photo.jpg';
  user = {
    nom: '',
    prenom: '',
    gender: '',
    country: '',
    phoneNumber: ''
  };

  username: string = '';
  updateSuccess: boolean = false;
  updateError: boolean = false;
  updateErrorMessage: string = ''
  
  
  
  profilePicture = 'https://via.placeholder.com/100';
  isAdminRoute = false;

  userRole: string | null = null;
  email: string | null = null;
  selectedFile: File | null = null;
  countryCodes: CountryCode[] = [
    {  code: '+33', flag: 'assets/images/france.png' },
    {  code: '+216', flag: 'assets/images/tunisie.png' }
  ];
  selectedCountryCode: CountryCode = this.countryCodes[0]; 
  isCountryCodeDropdownOpen = false;
  constructor(
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer
  ) {}

  selectCountryCode(country: CountryCode): void {
    this.selectedCountryCode = country;
    this.isCountryCodeDropdownOpen = false;
  }

  toggleCountryCodeDropdown(): void {
    this.isCountryCodeDropdownOpen = !this.isCountryCodeDropdownOpen;
  }

  extractPhoneNumberParts(phoneNumber: string): { countryCode: string, localNumber: string } {
    for (const country of this.countryCodes) {
      if (phoneNumber.startsWith(country.code)) {
        return {
          countryCode: country.code,
          localNumber: phoneNumber.slice(country.code.length)
        };
      }
    }
    // If no matching country code, default to first in list
    return {
      countryCode: this.countryCodes[0].code,
      localNumber: phoneNumber
    };
  }

  ngOnInit(): void {

    this.getUsername();
    

    const userInfo = this.decodeToken();
    if (userInfo) {
      // Fetch user role with the email
      this.fetchUserRole(userInfo.email);
    }

    this.isAdminRoute = this.router.url.includes('/admin');
   
    // Initialiser le formulaire
    this.profileForm = this.formBuilder.group({
      nom: [this.user.nom, Validators.required],
      prenom: [this.user.prenom, Validators.required],
      gender: [this.user.gender, Validators.required],
      country: [this.user.country, Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]]
    });

    

    this.loadUserProfile();
    

    
  }

  loadUserProfile(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {

        console.log("useeer",user)
        if (user) {
          const phoneNumberParts = this.extractPhoneNumberParts(user.phoneNumber || '');

          const matchingCountryCode = this.countryCodes.find(
            country => country.code === phoneNumberParts.countryCode
          ) || this.countryCodes[0];
          this.selectedCountryCode = matchingCountryCode;
          // Populate form with existing user data
          this.profileForm.patchValue({
            nom: user.firstName || '',
            prenom: user.lastName || '',
            gender: user.gender || '',
            
            country: user.country || '',
            phoneNumber: phoneNumberParts.localNumber
          });

          console.log('Country from user:', user.country);
  
           // Update profile picture if exists
           if (user.id && user.profilePhotoPath) {
            this.userService.getProfilePhotoByUser(user.id).subscribe({
              next: (blob) => {
                const objectUrl = URL.createObjectURL(blob);
                this.selectedProfilePicture = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
              },
              error: (err) => {
                console.error('Erreur chargement photo de profil :', err);
              }
            });
          }
          
          
          
        }
      },
      error: (err) => {
        console.error('Failed to load user profile:', err);
        // Handle error (show message to user, etc.)
      }
    });
  }




  onProfilePictureClick(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert('Only image files (JPEG, PNG, GIF) are allowed');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      const objectUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
      this.selectedProfilePicture = objectUrl;
      this.selectedFile = file;
    }
  }



  getUsername(): void {
    const user = this.userService.getUserFromToken(); // Assuming a method to extract user data
    if (user) {
      this.username = user.username;
    }
  }


  private decodeToken(): { email: string } | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decoding JWT
      return { email: payload.email };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
 

  fetchUserRole(email: string) {
    // Check if email exists before making the call
    if (!email) {
      console.error('No email found');
      return;
    }

    this.userService.getUserRole(email).subscribe({
      next: (role) => {
        this.userRole = role;
        console.log('User Role:', role);
      },
      error: (error) => {
        console.error('Error fetching user role', error);
        this.userRole = null;
      }
    });
  }

  validatePhoneNumber(): boolean {
    const phoneNumber = this.profileForm.get('phoneNumber')?.value;
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
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        console.log("useeer on submit", user);
        if (user) {
          const userId = user.id;
          console.log("userId",user.keycloakId)
           

     
          const formData = new FormData();
          const firstName = this.profileForm.get('nom')?.value;
          const lastName = this.profileForm.get('prenom')?.value;
          const phoneNumber = this.selectedCountryCode.code + this.profileForm.get('phoneNumber')?.value;
          // Add form fields to FormData
          formData.append('firstName', firstName);
          formData.append('lastName', lastName);
          formData.append('gender', this.profileForm.get('gender')?.value);
          formData.append('country', this.profileForm.get('country')?.value);
          formData.append('phoneNumber', phoneNumber);
  
          if (this.selectedFile) {
            formData.append('image', this.selectedFile, this.selectedFile.name); 
          }

          if (!this.validatePhoneNumber()) {
            const countryCode = this.selectedCountryCode.code;
            if (countryCode === '+216') {
              this.updateError = true;
              this.updateErrorMessage = 'Numéro tunisien invalide.Le numéro doit commencer 2 , 5 ,4  ou 9 et contenir 8 chiffres au total.';
            } else if (countryCode === '+33') {
              this.updateError = true;
              this.updateErrorMessage = 'Numéro français invalide.Le numéro doit commencer 6 ou 7 et contenir 9 chiffres au total.';
            }
           
            return;
          }

          const formControls = this.profileForm.controls;
          const requiredFields = ['nom', 'prenom', 'phoneNumber'];
          const emptyRequiredFields = requiredFields.filter(
            key => !formControls[key].value || formControls[key].value.trim() === ''
          );
          
          if (emptyRequiredFields.length > 0) {
            this.updateError = true;
            this.updateErrorMessage = "Veuillez remplir tous les champs obligatoires.";
            return;
          }
  
          this.userService.modifyProfile(userId, formData).subscribe({
            next: (updatedUser) => {
              console.log('Profile updated successfully', updatedUser);
          
              this.userService.updateUserFullName(firstName, lastName);
          
              if (this.selectedFile && updatedUser.profilePhotoPath) {
                const userId = updatedUser.id;
                this.userService.getProfilePhotoByUser(userId).subscribe({
                  next: (blob) => {
                    const objectUrl = URL.createObjectURL(blob);
                    this.selectedProfilePicture = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
                    this.userService.updateProfilePhoto(objectUrl);
                  },
                  error: (err) => {
                    console.error('Erreur chargement nouvelle photo de profil :', err);
                  }
                });
              }
              
              

             
              this.updateSuccess = true;
              this.updateError = false;
             
              setTimeout(() => this.clearMessages(), 2200);
            },

            
            error: (error) => {
              this.updateSuccess = false;
              this.updateError = true;
              console.error('Profile update failed', error);
              
              
              if (error.status === 409) {
                this.updateErrorMessage = 'Ce numéro de téléphone est actuellement associé à un autre compte.';
              } else if (error.status === 413) {
                this.updateErrorMessage = 'La photo dépasse la taille maximale autorisée.Veuillez sélectionner une image plus légère.';
              }else {
                this.updateErrorMessage = 'Échec de la mise à jour du profil. Veuillez réessayer.';
              }
              
            }
          });
        }
      },
      error: (err) => {
        this.updateSuccess = false;
        this.updateError = true;
        this.updateErrorMessage = 'Impossible de charger les informations utilisateur';
        setTimeout(() => this.clearMessages(), 2000);
      }
    });
  }  

  clearMessages(): void {
    this.updateSuccess = false;
    this.updateError = false;
    this.updateErrorMessage = '';
  }


}
