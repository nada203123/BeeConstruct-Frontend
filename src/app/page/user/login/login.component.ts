
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  showResetPassword = false;
  errorMessage: string | null = null;
  loginFailed = false;
  emailError = false;
  passwordError = false;
  emailErrorFormat = false;

  constructor(private fb: FormBuilder , private router: Router, private userService: UserService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}
  onEmailChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const email = inputElement.value.trim();

    // Reset previous error states
    this.emailErrorFormat = false;
    this.errorMessage = null;

    // Check if email is empty
    if (!email) {
      this.emailErrorFormat = true;
      this.errorMessage = 'L\'adresse e-mail est obligatoire';
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      this.emailErrorFormat = true;
      this.errorMessage = 'Veuillez utiliser une adresse e-mail valide';
      return;
    }
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.loginFailed = false;
    this.emailError = false;
    this.passwordError = false;
    this.errorMessage = null;
    
    const { email, password } = this.loginForm.value;
    if (email.length===0) {
      this.errorMessage = "L'adresse e-mail est requise";
      return;

    }
    if (password.length===0) {
      this.errorMessage = "le mot de passe est requis";
      return;
      }

    
    this.userService.login(email, password).subscribe({
      next: (response: any) => {
        console.log('Login successful', response);
        
        // Check for access_token and refresh_token
        if (response.access_token && response.refresh_token) {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          this.userService.getCurrentUser().subscribe({
            next: (userData) => {
              localStorage.setItem('user_role', userData.role); // Store role
              localStorage.setItem('user_data', JSON.stringify(userData)); // Store all user data if needed
              
              // Navigate based on role if needed
              this.router.navigate(['/accueil/statistiques']);
            },
            error: (error) => {
              console.error('Failed to get user data', error);
              this.router.navigate(['/accueil/statistiques']); // Still navigate but without role
            }
          });
        }
      },
      error: (error: any) => {
        console.log('Login failed', error.error.message);
        
        // Check if error has a body or error response
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          this.errorMessage = 'A client-side error occurred';
        } else {
          // Server-side error
          // Try to parse different error response formats
          if (error.error && typeof error.error === 'string') {
            try {
              const parsedError = JSON.parse(error.error);
              this.errorMessage = parsedError.message || 'Login failed';
            } catch {
              this.errorMessage = error.error;
            }
          } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Adresse e-mail ou mot de passe incorrect';
          }
        }
        
        this.loginFailed = true;
      }
    });
  }
  forgotPassword(): void {
    this.showResetPassword = true;
  }
}