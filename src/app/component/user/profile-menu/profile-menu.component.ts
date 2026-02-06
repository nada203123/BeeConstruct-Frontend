// component/profile-menu/profile-menu.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environment/environment';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.css'] 
})
export class ProfileMenuComponent implements OnInit, OnDestroy {
  isDropdownOpen = false;
  username: string = '';
  private apiUrl = environment.apiUrlUser;
  fullName: string = '';

  selectedProfilePicture: SafeUrl = 'assets/images/photo.jpg';

  private photoSubscription: Subscription = new Subscription();
  private fullNameSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private userService: UserService,
    private sanitizer: DomSanitizer 
  ) {}

  ngOnInit(): void {
    this.getUsername();

   
    this.photoSubscription = this.userService.profilePhoto$.subscribe(
      (photoPath) => {
        if (photoPath) {
         
          this.selectedProfilePicture = this.sanitizer.bypassSecurityTrustUrl(photoPath);
        } else {
          
          this.selectedProfilePicture = 'assets/images/photo.jpg';
        }
      }
    );

  
    this.fullNameSubscription = this.userService.userFullName$.subscribe(
      (userFullName) => {
        if (userFullName) {
          this.fullName = `${userFullName.firstName} ${userFullName.lastName}`;
          this.username = this.fullName;
        }
      }
    );

   
    this.loadInitialPhoto();
  }

  ngOnDestroy(): void {
    this.photoSubscription.unsubscribe();
    this.fullNameSubscription.unsubscribe();
  }

  getUsername(): void {
    const user = this.userService.getUserFromToken();
    if (user) {
      this.username = user.username;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  navigateToProfile(): void {
    this.router.navigate(['/accueil/modify-profile']);
    this.isDropdownOpen = false;
  }

  navigateToChangePassword(): void {
    this.router.navigate(['/accueil/update-password']);
    this.isDropdownOpen = false;
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.clearSession();
      return;
    }

    this.userService.logout(refreshToken).subscribe({
      next: () => {
        this.clearSession();
      },
      error: () => {
        this.clearSession();
      }
    });
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  private loadInitialPhoto(): void {
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
            }
          });
        }
      },
      error: (err) => {
        console.error('Erreur récupération utilisateur :', err);
      }
    });
  }
}
