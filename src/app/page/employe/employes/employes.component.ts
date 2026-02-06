import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Employe } from '../../../models/employe.model';
import { EmployeService } from '../../../services/employes/employe.service';

@Component({
  selector: 'app-employes',
  templateUrl: './employes.component.html',
  styleUrl: './employes.component.css'
})
export class EmployesComponent implements OnInit {
  employes: Employe[] = [];
  showAddEmployeModal = false;
  currentPage = 1;
  itemsPerPage = 5;
  employesToDisplay: any[] = [];
  currentUserEmail: string | null = null;
  filteredEmployes: Employe[] = [];
  searchQuery: string = '';
  isSuccess: boolean = false;
  selectedEmploye: any = null;
  showModifyEmployeModal: boolean = false;
  isSuccessModified: boolean = false;
  errorMessage: string = '';
  showArchiveConfirmModal: boolean = false; 
  selectedEmployeId: number | null = null; 
  isSuccessArchive: boolean = false;
  userRole: string = '';
  canPerformActions: boolean = false;
  
  employeType: string = 'interne';

  constructor(
    private employeService: EmployeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getUserRole();
    this.loadEmployes();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEmployes.length / this.itemsPerPage);
  }

  getUserRole(): void {
    const role = localStorage.getItem('user_role');
    this.userRole = role || '';
    this.canPerformActions = this.userRole === 'Administrateur' || this.userRole === 'Chargé commercial';
    console.log("Role in archive:", this.userRole);
    console.log("Can perform actions:", this.canPerformActions);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadEmployesForPage();
  }

  loadEmployesForPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.employesToDisplay = this.filteredEmployes.slice(startIndex, endIndex);
    console.log(this.employesToDisplay);
  }

  loadEmployes(): void {
    this.employeService.getAllActiveEmployes().subscribe({
      next: (data) => {
        this.employes = data;
        console.log('Loaded interne employes:', this.employes);
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching employes:', err);
      }
    });
  }

 

  openArchiveConfirmModal(userId: number): void {
    this.selectedEmployeId = userId;
    this.showArchiveConfirmModal = true;
  }

  confirmArchive(): void {
    if (this.selectedEmployeId) {
      this.archiveEmploye(this.selectedEmployeId);
      this.showArchiveConfirmModal = false; 
      this.selectedEmployeId = null; 
    }
  }

  cancelArchive(): void {
    this.showArchiveConfirmModal = false; 
    this.selectedEmployeId = null; 
  }

  search(): void {
    this.currentPage = 1; 
    this.applyFilter();
  }

  applyFilter(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredEmployes = [...this.employes];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredEmployes = this.employes.filter(employe => 
        `${employe.firstName} ${employe.lastName}`.toLowerCase().includes(query) ||
        employe.telephone?.toLowerCase().includes(query) ||
        employe.rib?.toLowerCase().includes(query) ||
        employe.adresse?.toLowerCase().includes(query)
      );
    }
    this.loadEmployesForPage();
  }

  

  openAddEmployeModal(): void {
    this.showAddEmployeModal = true;
  }

  closeAddEmployeModal(): void {
    this.showAddEmployeModal = false;
  }

  onEmployeAdded(): void {
    this.isSuccess = true;
    this.loadEmployes();
    this.closeAddEmployeModal();
    setTimeout(() => {
      this.isSuccess = false;
    }, 1800);
  }

  getFullName(employe: Employe): string {
    return `${employe.firstName} ${employe.lastName}`;
  }

  editEmploye(userId: number): void {
    this.errorMessage = ''; 
    const employe = this.employes.find(u => u.id === userId);
    if (employe) {
      this.selectedEmploye = { ...employe };
      this.showModifyEmployeModal = true;
      console.log('Edit employe:', userId);
      console.log("edited employe", this.selectedEmploye);
    } else {
      console.error('Employe not found with Id:', userId);
    }
  }

  updateEmploye(): void {
    this.isSuccessModified = true;
    this.loadEmployes();
    this.closeModifyUserModal();
    setTimeout(() => {
      this.isSuccessModified = false;
    }, 1800);
  }

  archiveEmploye(employeId: number): void {
    console.log('archiveEmploye called with employeId:', employeId);
    this.employeService.archiveEmploye(employeId).subscribe(
      (response) => {
        console.log('Employe archived successfully, response:', response);
        this.employes = this.employes.map(employe => 
          employe.id === employeId ? {...employe, archived: true} : employe
        );
        this.loadEmployesForPage();
        this.loadEmployes();
        this.isSuccessArchive = true;
        console.log('isSuccessArchive set to true (success callback)');
        setTimeout(() => {
          this.isSuccessArchive = false;
          console.log('isSuccessArchive set to false (success callback)');
        }, 1800);
      },
      (error) => {
        console.error('Error archiving employe:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
      }
    );
  }

  closeModifyUserModal(): void {
    this.showModifyEmployeModal = false;
    this.selectedEmploye = null;
  }
}