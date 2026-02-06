import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environment/environment';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';



@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.css'
})
export class UpdatePasswordComponent implements OnInit {
  passwordForm: FormGroup; 
  private apiUrl = environment.apiUrlUser;
  selectedProfilePicture: SafeUrl = 'assets/images/photo.jpg';
  updateSuccess: boolean = false;
  updateError: boolean = false;
  isAdminRoute = false;
  showPassword: boolean = false;
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  username: string = '';
  updateErrorMessage: string = ''

  userRole: string | null = null;
  email: string | null = null;
  selectedFile: File | null = null;
  userEmail: string | null = null;

   constructor(
      private router: Router,
      private userService: UserService,
      private formBuilder: FormBuilder,
      private sanitizer: DomSanitizer
    ) {
      this.passwordForm = this.formBuilder.group({
        currentPassword: ['', Validators.required],  
        newPassword: ['', [Validators.required, Validators.minLength(8)]],  
        confirmPassword: ['', Validators.required]  
      });
    }


    ngOnInit(): void {
    
        this.getUsername();
        this.userEmail = this.userService.getEmailFromToken()?.email;
        console.log("email",this.userEmail)
       
    
        const userInfo = this.decodeToken();
        if (userInfo) {
          // Fetch user role with the email
          this.fetchUserRole(userInfo.email);
        }
    
        this.isAdminRoute = this.router.url.includes('/accueil');
    
        this.loadUserProfile();
        
      }

      togglePasswordVisibility(field: string): void {
        switch(field) {
          case 'current':
            this.showCurrentPassword = !this.showCurrentPassword;
            break;
          case 'new':
            this.showNewPassword = !this.showNewPassword;
            break;
          case 'confirm':
            this.showConfirmPassword = !this.showConfirmPassword;
            break;
        }
      }

      getInputType(field: string): string {
        switch(field) {
          case 'current':
            return this.showCurrentPassword ? 'text' : 'password';
          case 'new':
            return this.showNewPassword ? 'text' : 'password';
          case 'confirm':
            return this.showConfirmPassword ? 'text' : 'password';
          default:
            return 'password';
        }
      }

      private passwordMatchValidator(form: FormGroup) {
        const newPassword = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        return newPassword === confirmPassword ? null : { mismatch: true };
      }

      

      loadUserProfile(): void {
        this.userService.getCurrentUser().subscribe({
          next: (user) => {
            if (user?.id && user.profilePhotoPath) {
            
              this.userService.getProfilePhotoByUser(user.id).subscribe({
                next: (blob) => {
                  const objectUrl = URL.createObjectURL(blob);
                  const trustedUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
                  this.selectedProfilePicture = trustedUrl;
      
                
                  this.userService.updateProfilePhoto(objectUrl);
                },
                error: (err) => {
                  console.error('Erreur chargement photo de profil :', err);
                  this.selectedProfilePicture = 'assets/images/photo.jpg'; 
                }
              });
            } else {
              this.selectedProfilePicture = 'assets/images/photo.jpg';
            }
          },
          error: (err) => {
            console.error('Erreur récupération utilisateur :', err);
            this.updateError = true;
            this.updateErrorMessage = 'Échec de la récupération du profil utilisateur';
          }
        });
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


  clearMessages(): void {
    this.updateSuccess = false;
    this.updateError = false;
    this.updateErrorMessage = '';
  }

  onSubmit(): void {
    
      const passwordData = {
        email: this.userEmail,
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value,
        confirmPassword: this.passwordForm.get('confirmPassword')?.value
      };

      const formControls = this.passwordForm.controls;
      const emptyFields = Object.keys(formControls).filter(
        key => !formControls[key].value || formControls[key].value.trim() === ''
      );
    
      if (emptyFields.length > 0) {
        this.updateError = true;
        this.updateErrorMessage = "Veuillez remplir tous les champs.";
        return;
      } 

      const newPasswordControl = this.passwordForm.get('newPassword')?.value;
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

if (newPasswordControl && newPasswordControl.trim() !== '') {
  if (!passwordRegex.test(newPasswordControl)) {
    this.updateError = true;
    this.updateErrorMessage = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.';
    return;
  }
}

      this.userService.modifyPassword(passwordData).subscribe({
        next: (response) => {
          console.log("Success:", response);
          this.updateSuccess = true;
          this.passwordForm.reset();
          setTimeout(() => this.clearMessages(), 2300);
        },
        error: (err) => {
          console.log("data of password",passwordData)
          this.updateError = true;
          console.log("erreur",err.error.message)
          console.log("erreur status",err.status)
          if (err.status === 401) {
            this.updateErrorMessage = 'Le mot de passe actuel est incorrect.';
          } else if (err.status === 400) {
            this.updateErrorMessage = 'Les mots de passe ne correspondent pas.';
          } else if (err.status === 404) {
            this.updateErrorMessage = 'Utilisateur non trouvé.';
          } else {
            this.updateErrorMessage = err.error?.message || 'Failed to update password';
          }
          
        }
      });
    }

  

}
