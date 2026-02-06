import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-side-bar-admin',
  templateUrl: './side-bar-admin.component.html',
  styleUrl: './side-bar-admin.component.css'
})
export class SideBarAdminComponent implements OnInit {
  allMenuItems = [
    { icon: 'home', label: 'Accueil', route: '/accueil/statistiques', active: false, roles: ['administrateur', 'chargé commercial' , 'chargé de production'] },
    { icon: 'users', label: 'Utilisateurs', route: '/accueil/users', active: false, roles: ['administrateur'] },
    { icon: 'user', label: 'Clients', route: '/accueil/clients', active: false , roles: ['administrateur', 'chargé commercial' ]},
    { icon: 'file-text', label: 'Chantier en prospection', route: '/accueil/offre', active: false, roles: ['administrateur', 'chargé commercial','chargé de production'] },
    { icon: 'briefcase', label: 'Employés', route: '/accueil/employes', active: false, roles: ['administrateur' ,'chargé commercial'] },
    { icon: 'hard-hat', label: 'Chantiers', route: '/accueil/chantiers', active: false, roles: ['administrateur', 'chargé commercial','chargé de production'] },
    { icon: 'archive', label: 'Archive', route: '/accueil/archives', active: false, roles: ['administrateur','chargé commercial','chargé de production']},
   
  ];

  menuItems: any[] = [];
  userRole: string = '';
  
  constructor( private router: Router,private userService: UserService,private cdr: ChangeDetectorRef) {
      
  }

  ngOnInit(): void {
    this.getUserRoleAndFilterMenu();
    this.setActiveMenuItemBasedOnRoute();
    
    // Listen for route changes to update active menu item
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setActiveMenuItemBasedOnRoute();
    });
  }

  setActiveMenuItemBasedOnRoute(): void {
    const currentRoute = this.router.url;
    
    this.menuItems.forEach(item => {
      item.active = currentRoute.startsWith(item.route);
    });
    
    this.cdr.detectChanges();
  }

  getUserRoleAndFilterMenu(): void {
    // Get role from localStorage or service
    const role = localStorage.getItem('user_role');
    this.userRole = role || '';
    console.log("rooole",this.userRole);
    
    // Filter menu items based on role
    if (this.userRole) {
      this.menuItems = this.allMenuItems.filter(item => 
        item.roles.includes(this.userRole.toLowerCase())
      );
    } else {
      // Default to empty if no role found
      this.menuItems = [];
    }
  }

  navigateTo(item: any): void {
    
    this.allMenuItems.forEach(allMenuItem => allMenuItem.active = false);
    
    item.active = true;
    
    this.cdr.detectChanges();
  }

  
logout() {
  const refreshToken = localStorage.getItem('refresh_token'); 
  if (!refreshToken) {
    console.warn('No refresh token found.');
      this.clearSession();
      return;
  }

  this.userService.logout(refreshToken).subscribe({
    next: () => {
      console.log('Logged out successfully.');
      this.clearSession();
    },
    error: (err) => {
      console.error('Logout failed:', err);
      this.clearSession(); 
    }
  });
}
private clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_data');
  this.router.navigate(['/login']); 
}
}
