import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'] 
})
export class ResetPasswordComponent  {
  email: string = ''; 
  code: string = ''; 
  newPassword: string = '';
  confirmPassword: string = '';
  step: number = 1; 
  showNewPassword: boolean = false; 
  showConfirmPassword: boolean = false; 
  invalidCodeError: boolean = false;  
  expiredCodeError: boolean = false;  
  mismatchError: boolean = false; 
  formatError: boolean = false;   
  isSuccess: boolean = false;
  emailNotFoundError: boolean = false;
  isOtpRegenerated: boolean = false;
  emailFormatError: boolean = false;
  emailEmptyError:boolean =false;
  codeEmptyError: boolean = false;
  @Output() close = new EventEmitter<void>(); 

   constructor( private userService: UserService) {
      
    }

    clearErrorMessages() {
      this.invalidCodeError = false;
      this.expiredCodeError = false;
      this.isOtpRegenerated = false;
      this.codeEmptyError = false ;
    }

    
   
    
  resetPassword() {
    if (this.step === 1) {
      this.emailFormatError = false;
      this.emailEmptyError = false;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

      if (this.email.length===0) {
        this.emailEmptyError = true;
        return;
      }

      if (!emailRegex.test(this.email)) {
        this.emailFormatError = true;
        
        return;
      }
      
      console.log('Reset password requested for:', this.email);
      localStorage.setItem('email', this.email);
      this.userService.forgotPassword(this.email).subscribe(
        (response : String) => {
          console.log('Response received:', response);
          this.step = 2;
          console.log('Step updated to:', this.step);
          this.emailNotFoundError = false;
        },
        (error) => {
          if (error.status === 401) { 
            this.emailNotFoundError = true;
            this.emailFormatError = false;
          }
        }
      );
    } else if (this.step === 2) {
      if ( this.code.length == 0) {
            this.codeEmptyError = true;
            return;
      }
      const storedEmail = localStorage.getItem('email');
      if (storedEmail) {
        this.email = storedEmail;  
      } else {
        console.log('Email not found in localStorage');
      }
      
      console.log('Verifying OTP for email:', this.email);
     
      this.userService.verifyOtp({ email: this.email, otpCode: this.code }).subscribe(
        (response : String) => {
          console.log('OTP verified:', response);
          this.step = 3; 
        },
        (error) => {
         
          if (error.status === 401 ) {
            this.invalidCodeError = true;
          } else if (error.status === 400 ) {
            this.expiredCodeError = true;
          }
        }
      )
        
      
      
    } else if (this.step === 3) {
      const storedEmail = localStorage.getItem('email');
      if (storedEmail) {
        this.email = storedEmail;  
      } else {
        console.log('Email not found in localStorage');
      }

      
      this.mismatchError = false;
      this.formatError = false;

      
      if (this.newPassword !== this.confirmPassword) {
        this.mismatchError = true;
        return;
      }
     
    
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
      if (!passwordRegex.test(this.newPassword)) {
        this.formatError = true;
        return;
      }
      
      this.userService.resetPassword({
        email: this.email,
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword
      }).subscribe(
        (response) => {
          console.log('Password reset successful:', response);
          this.isSuccess = true;
          localStorage.removeItem('email') 
          setTimeout(() => {
      this.isSuccess = false;
      this.closeModal();
    }, 1800);
    
        },
        (error) => {
          console.log('Error:', error);
        }
      );
    }
  }

  togglePasswordVisibility(field: 'newPassword' | 'confirmPassword') {
  
    if (field === 'newPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }

  }

  closeModal() {
    this.close.emit(); 
  }

  regenerateOtpCode() {
    const storedEmail = localStorage.getItem('email');
      if (storedEmail) {
        this.email = storedEmail;  
      } else {
        console.log('Email not found in localStorage');
      }
    this.userService.regenerateOtp(this.email).subscribe(
      (response : String) => {
        console.log('Nouveau code OTP envoyé avec succès.',response);
        this.isOtpRegenerated = true;
        this.expiredCodeError = false; 
        
        
      },
      (error) => {
        console.error('Erreur lors de la régénération du code OTP :', error);
        if (error.status === 400) {
          alert('OTP is still valid. Please verify the current OTP.');
        } else if (error.status === 500) {
          alert('Failed to send OTP. Please try again later.');
        } else {
          alert('An unexpected error occurred. Please try again later.');
        }
      }
    );
  }

}
