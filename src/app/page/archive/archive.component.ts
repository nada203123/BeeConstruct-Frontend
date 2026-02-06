import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Client } from '../../models/client.model';
import { ClientService } from '../../services/client.service';
import { Employe } from '../../models/employe.model';
import { EmployeService } from '../../services/employes/employe.service';
import { EquipmentService, Equipment } from '../../services/equipment/equipment.service';
import { UserService } from '../../services/user.service';
import { OffreService } from '../../services/offres/offre.service';
import { forkJoin, map } from 'rxjs';
import { DevisService } from '../../services/devis/devis.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnInit {
  @Input() dropdownOptions: string[] = ['Utilisateurs', 'Clients', 'Employés', 'Équipements', 'Chantier en prospection', 'Devis'];
  @Input() defaultOption: string = 'Utilisateurs';
  @Output() optionSelected = new EventEmitter<string>();
  archivedClients: Client[] = [];
  archivedEmployees: Employe[] = [];
  archivedEquipment: Equipment[] = [];
  archivedUsers: any[] = [];
  archivedOffres: any[] = [];
  archivedDevis: any[] = [];

  userRole: string = '';
  canPerformActions: boolean = false;
  canSeeArchivedUser: boolean = false;

  currentPage = 1;
  itemsPerPage = 4;

  itemsToDisplay: any[] = [];
  filteredItems: any[] = [];

  searchQuery: string = '';
  isSuccessRestore: boolean = false;
  showRestoreConfirmModal: boolean = false;
  showDeleteConfirmModal: boolean = false;
  selectedItemId: number | null = null;
  errorMessage: string = '';
  isSuccessDelete: boolean = false;
  isDropdownOpen: boolean = false;
  selectedOption: string;
  clientNames: { [key: number]: string } = {};

  selectedDevis: any = null;
  showHistoryModal: boolean = false;
  selectedDevisHistory: any[] = [];

  role: string | null | undefined;

  constructor(
    private clientService: ClientService,
    private employeService: EmployeService,
    private equipmentService: EquipmentService,
    private userService: UserService,
    private offreService: OffreService,
    private devisService: DevisService
  ) {
    this.selectedOption = this.defaultOption;
  }

  ngOnInit(): void {
    this.getUserRole();
      if (this.userRole === 'Chargé commercial') {
    this.selectedOption = 'Clients';
  } else if (this.userRole === 'Chargé de production') {
    this.selectedOption = 'Chantier en prospection';
  } else {
    // Default fallback if needed
    this.selectedOption = this.defaultOption || 'Utilisateurs';
  }
    this.loadArchivedData();
     this.role = localStorage.getItem('user_role');
  }

  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadItemsForPage();
  }

  loadItemsForPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.itemsToDisplay = this.filteredItems.slice(startIndex, endIndex);
  }

  loadArchivedData(): void {
    this.currentPage = 1;

    if (this.selectedOption === 'Clients') {
      this.loadArchivedClients();
    } else if (this.selectedOption === 'Employés') {
      this.loadArchivedEmployees();
    } else if (this.selectedOption === 'Équipements') {
      this.loadArchivedEquipment();
    } else if (this.selectedOption === 'Utilisateurs') {
      this.loadArchivedUsers();
    } else if (this.selectedOption === 'Chantier en prospection') {
      this.loadArchivedOffres();
    } else if (this.selectedOption === 'Devis') {
      this.loadArchivedDevis();
    }
  }

  getUserRole(): void {
    const role = localStorage.getItem('user_role');
    this.userRole = role || '';
    this.canSeeArchivedUser = this.userRole === 'Administrateur';
    this.canPerformActions = this.userRole === 'Administrateur' || this.userRole === 'Chargé commercial';
    console.log("Role in archive:", this.userRole);
    console.log("Can perform actions:", this.canPerformActions);
  }

  loadArchivedClients(): void {
    this.clientService.getAllArchivedClients().subscribe({
      next: (data) => {
        this.archivedClients = data;
        this.filteredItems = this.archivedClients;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching archived clients:', err);
        if (err.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to load archived clients. Please try again later.';
        }
      }
    });
  }

  loadArchivedUsers(): void {
    this.userService.getArchivedUsers().subscribe({
      next: (data) => {
        this.archivedUsers = data;
        this.filteredItems = this.archivedUsers;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching archived users:', err);
        if (err.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to load archived users. Please try again later.';
        }
      }
    });
  }

  loadArchivedEmployees(): void {
    this.employeService.getAllArchivedEmployes().subscribe({
      next: (data) => {
        this.archivedEmployees = data;
        console.log('Archived Employees Data:', this.archivedEmployees);
        const sousTraitantEmployees = this.archivedEmployees.filter(emp => emp.type === 'SOUS_TRAITANT');
        console.log('SOUS_TRAITANT Employees:', sousTraitantEmployees);
        sousTraitantEmployees.forEach(emp => {
          console.log(`SOUS_TRAITANT Employee ID ${emp.id}:`, {
            soustraitant: emp.soustraitant,
            nomRepresentant: emp.nomRepresentant,
            prenomRepresentant: emp.prenomRepresentant,
            companyName: emp.companyName,
            legalRepresentative: emp.legalRepresentative
          });
        });
        this.filteredItems = this.archivedEmployees;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching archived employees:', err);
        if (err.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to load archived employees. Please try again later.';
        }
      }
    });
  }

  loadArchivedEquipment(): void {
    this.equipmentService.getAllArchivedEquipment().subscribe({
      next: (data) => {
        this.archivedEquipment = data;
        this.filteredItems = this.archivedEquipment;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching archived equipment:', err);
        if (err.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to load archived equipment. Please try again later.';
        }
      }
    });
  }

  loadArchivedOffres(): void {
    this.offreService.getAllArchivedOffres().subscribe({
      next: (data) => {
        this.archivedOffres = data;
        this.filteredItems = this.archivedOffres;
        this.loadClientNamesForOffres();
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching archived offres:', err);
        if (err.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to load archived offres. Please try again later.';
        }
      }
    });
  }

  loadArchivedDevis(): void {
    this.devisService.getAllArchivedDevis().subscribe({
      next: (data) => {
        this.archivedDevis = data.map(item => ({
          ...item,
          status: item.statut 
        }));
        console.log('Archived Devis Data:', this.archivedDevis);
        this.filteredItems = this.archivedDevis;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching archived devis:', err);
        if (err.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to load archived devis. Please try again later.';
        }
      }
    });
  }

  loadClientNamesForOffres(): void {
    const requests = this.archivedOffres.map(offre => 
      this.offreService.getClientName(offre.id).pipe(
        map(client => ({
          offreId: offre.id,
          fullName: `${client.nomSociete} `
        }))
      )
    );
  
    if (requests.length === 0) return;
  
    forkJoin(requests).subscribe({
      next: (results) => {
        results.forEach(result => {
          this.clientNames[result.offreId] = result.fullName;
        });
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching client names for offres:', err);
      }
    });
  }

  getClientName(itemId: number): string {
    if (this.selectedOption === 'Chantier en prospection') {
      return this.clientNames[itemId] || 'Client inconnu';
    } else if (this.selectedOption === 'Devis') {
      const devis = this.archivedDevis.find(d => d.id === itemId);
      if (devis && devis.clientFirstName && devis.clientLastName) {
        return `${devis.clientFirstName} ${devis.clientLastName}`;
      }
      return 'Client inconnu';
    }
    return 'Client inconnu'; 
  }

  openRestoreConfirmModal(itemId: number): void {
    this.selectedItemId = itemId;
    this.showRestoreConfirmModal = true;
  }

  openDeleteConfirmModal(itemId: number): void {
    this.selectedItemId = itemId;
    this.showDeleteConfirmModal = true;
  }

  confirmRestore(): void {
    if (this.selectedItemId) {
      if (this.selectedOption === 'Clients') {
        this.restoreClient(this.selectedItemId);
      } else if (this.selectedOption === 'Employés') {
        this.restoreEmploye(this.selectedItemId);
      } else if (this.selectedOption === 'Équipements') {
        this.restoreEquipment(this.selectedItemId);
      } else if (this.selectedOption === 'Utilisateurs') {
        this.restoreUser(this.selectedItemId);
      } else if (this.selectedOption === 'Chantier en prospection') {
        this.restoreOffre(this.selectedItemId);
      } else if (this.selectedOption === 'Devis') {
        this.restoreDevis(this.selectedItemId);
      }
      this.showRestoreConfirmModal = false;
      this.selectedItemId = null;
    }
  }

  confirmDelete(): void {
    if (this.selectedItemId) {
      if (this.selectedOption === 'Clients') {
        this.deleteClient(this.selectedItemId);
      } else if (this.selectedOption === 'Employés') {
        this.deleteEmploye(this.selectedItemId);
      } else if (this.selectedOption === 'Équipements') {
        this.deleteEquipment(this.selectedItemId);
      } else if (this.selectedOption === 'Utilisateurs') {
        this.deleteUser(this.selectedItemId);
      } else if (this.selectedOption === 'Chantier en prospection') {
        this.deleteOffre(this.selectedItemId);
      } else if (this.selectedOption === 'Devis') {
        this.deleteDevis(this.selectedItemId);
      }
      this.showDeleteConfirmModal = false;
      this.selectedItemId = null;
    }
  }

  cancelRestore(): void {
    this.showRestoreConfirmModal = false;
    this.selectedItemId = null;
  }

  cancelDelete(): void {
    this.showDeleteConfirmModal = false;
    this.selectedItemId = null;
  }

  search(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      if (this.selectedOption === 'Clients') {
        this.filteredItems = [...this.archivedClients];
      } else if (this.selectedOption === 'Employés') {
        this.filteredItems = [...this.archivedEmployees];
      } else if (this.selectedOption === 'Équipements') {
        this.filteredItems = [...this.archivedEquipment];
      } else if (this.selectedOption === 'Utilisateurs') {
        this.filteredItems = [...this.archivedUsers];
      } else if (this.selectedOption === 'Chantier en prospection') {
        this.filteredItems = [...this.archivedOffres];
      } else if (this.selectedOption === 'Devis') {
        this.filteredItems = [...this.archivedDevis];
      }
    } else {
      const query = this.searchQuery.toLowerCase().trim();

      if (this.selectedOption === 'Clients') {
        this.filteredItems = this.archivedClients.filter(client =>
          `${client.nomDirecteur} ${client.prenomDirecteur}`.toLowerCase().includes(query) ||
          client.nomSociete?.toLowerCase().includes(query) ||
          client.siegeSocial?.toLowerCase().includes(query) ||
          client.adresse?.toLowerCase().includes(query) ||
          client.telephoneDirecteur?.toLowerCase().includes(query)
        );
      } else if (this.selectedOption === 'Employés') {
        this.filteredItems = this.archivedEmployees.filter(employee => {
          const formattedType = this.formatEmployeeType(employee.type).toLowerCase();
          if (employee.type === 'PER_DIEM' || employee.type === 'FORFAIT') {
            return (
              `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(query) ||
              employee.telephone?.toLowerCase().includes(query) ||
              employee.adresse?.toLowerCase().includes(query) ||
              employee.rib?.toLowerCase().includes(query) ||
              formattedType.includes(query)
            );
          } else if (employee.type === 'SOUS_TRAITANT' || employee.type === 'SOUSTRAITANT') {
            return (
              employee.soustraitant?.toLowerCase().includes(query) ||
              (employee.nomRepresentant && employee.prenomRepresentant ? 
                `${employee.nomRepresentant} ${employee.prenomRepresentant}` : '').toLowerCase().includes(query) ||
              employee.adresse?.toLowerCase().includes(query) ||
              employee.adresseRepresentant?.toLowerCase().includes(query) ||
              employee.telephoneRepresentant?.toLowerCase().includes(query) ||
              formattedType.includes(query)
            );
          }
          return false; // Exclude any unexpected types
        });
      } else if (this.selectedOption === 'Équipements') {
        this.filteredItems = this.archivedEquipment.filter(equipment =>
          equipment.name.toLowerCase().includes(query)
        );
      } else if (this.selectedOption === 'Utilisateurs') {
        this.filteredItems = this.archivedUsers.filter(user =>
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
          user.telephone?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
        );
      } else if (this.selectedOption === 'Chantier en prospection') {
        this.filteredItems = this.archivedOffres.filter(offre =>
          offre.titre?.toLowerCase().includes(query) ||
          this.getClientName(offre.id)?.toLowerCase().includes(query) ||
          offre.localisation?.toLowerCase().includes(query) ||
          offre.statutOffre?.toLowerCase().includes(query)
        );
      } else if (this.selectedOption === 'Devis') {
        this.filteredItems = this.archivedDevis.filter(devis =>
          devis.offer?.toLowerCase().includes(query) || 
          this.getClientName(devis.id)?.toLowerCase().includes(query) || 
          devis.status?.toLowerCase().includes(query)
        );
      }
    }
    this.loadItemsForPage();
  }

  getFullName(item: any): string {
    if (this.selectedOption === 'Employés') {
      return `${item.firstName} ${item.lastName}`;
    }
    if (this.selectedOption === 'Équipements') {
      return item.name;
    }
    if (this.selectedOption === 'Utilisateurs') {
      return item.name;
    }
    return `${item.nomDirecteur} ${item.prenomDirecteur}`;
  }

  getLegalRepresentative(item: Employe): string {
    if (item.nomRepresentant && item.prenomRepresentant) {
      return `${item.nomRepresentant} ${item.prenomRepresentant}`;
    }
    return '-';
  }

  formatEmployeeType(type: string): string {
    switch (type) {
      case 'SOUS_TRAITANT':
      case 'SOUSTRAITANT':
        return 'Sous-traitant';
      case 'PER_DIEM':
        return 'Per diem';
      case 'FORFAIT':
        return 'Forfait';
      default:
        return type;
    }
  }

  restoreClient(clientId: number): void {
    this.clientService.restoreClient(clientId).subscribe(
      (response) => {
        this.archivedClients = this.archivedClients.filter(client => client.id !== clientId);
        this.applyFilter();
        this.isSuccessRestore = true;
        setTimeout(() => {
          this.isSuccessRestore = false;
        }, 1800);
      },
      (error) => {
        console.error('Error restoring client:', error);
        if (error.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to restore client. Please try again later.';
        }
      }
    );
  }

  restoreEmploye(employeeId: number): void {
    this.employeService.restoreEmploye(employeeId).subscribe(
      (response) => {
        this.archivedEmployees = this.archivedEmployees.filter(employee => employee.id !== employeeId);
        this.applyFilter();
        this.isSuccessRestore = true;
        setTimeout(() => {
          this.isSuccessRestore = false;
        }, 1800);
      },
      (error) => {
        console.error('Error restoring employee:', error);
        if (error.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to restore employee. Please try again later.';
        }
      }
    );
  }

  restoreEquipment(equipmentId: number): void {
    this.equipmentService.restoreEquipment(equipmentId).subscribe(
      (response) => {
        this.archivedEquipment = this.archivedEquipment.filter(equipment => equipment.id !== equipmentId);
        this.applyFilter();
        this.isSuccessRestore = true;
        setTimeout(() => {
          this.isSuccessRestore = false;
        }, 1800);
      },
      (error) => {
        console.error('Error restoring equipment:', error);
        if (error.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to restore equipment. Please try again later.';
        }
      }
    );
  }

  restoreUser(userId: number): void {
    this.userService.restoreUser(userId).subscribe(
      (response) => {
        this.archivedUsers = this.archivedUsers.filter(user => user.id !== userId);
        this.applyFilter();
        this.isSuccessRestore = true;
        setTimeout(() => {
          this.isSuccessRestore = false;
        }, 1800);
      },
      (error) => {
        console.error('Error restoring user:', error);
        if (error.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to restore user. Please try again later.';
        }
      }
    );
  }

  restoreOffre(offreId: number): void {
    this.offreService.restoreOffre(offreId).subscribe(
      (response) => {
        this.archivedOffres = this.archivedOffres.filter(offre => offre.id !== offreId);
        this.applyFilter();
        this.isSuccessRestore = true;
        setTimeout(() => {
          this.isSuccessRestore = false;
        }, 1800);
      },
      (error) => {
        console.error('Error restoring offre:', error);
        this.errorMessage = 'Failed to restore offre. Please try again later.';
      }
    );
  }

  restoreDevis(devisId: number): void {
    this.devisService.restoreDevis(devisId).subscribe({
      next: () => {
        this.archivedDevis = this.archivedDevis.filter(devis => devis.id !== devisId);
        this.applyFilter();
        this.isSuccessRestore = true;
        setTimeout(() => {
          this.isSuccessRestore = false;
        }, 1800);
      },
      error: (err) => {
        console.error('Error restoring devis:', err);
        if (err.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to restore devis. Please try again later.';
        }
      }
    });
  }

  deleteClient(clientId: number): void {
    this.clientService.deleteClient(clientId).subscribe(
      (response) => {
        this.archivedClients = this.archivedClients.filter(client => client.id !== clientId);
        this.applyFilter();
        this.isSuccessDelete = true;
        setTimeout(() => {
          this.isSuccessDelete = false;
        }, 1800);
      },
      (error) => {
        console.error('Error deleting client:', error);
        if (error.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to delete client. Please try again later.';
        }
      }
    );
  }

  deleteEmploye(employeeId: number): void {
    this.employeService.deleteEmploye(employeeId).subscribe(
      (response) => {
        this.archivedEmployees = this.archivedEmployees.filter(employee => employee.id !== employeeId);
        this.applyFilter();
        this.isSuccessDelete = true;
        setTimeout(() => {
          this.isSuccessDelete = false;
        }, 1800);
      },
      (error) => {
        console.error('Error deleting employee:', error);
        if (error.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to delete employee. Please try again later.';
        }
      }
    );
  }

  deleteEquipment(equipmentId: number): void {
    this.equipmentService.deleteEquipment(equipmentId).subscribe(
      () => {
        this.archivedEquipment = this.archivedEquipment.filter(equipment => equipment.id !== equipmentId);
        this.applyFilter();
        this.isSuccessDelete = true;
        setTimeout(() => {
          this.isSuccessDelete = false;
        }, 1800);
      },
      (error) => {
        console.error('Error deleting equipment:', error);
        if (error.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to delete equipment. Please try again later.';
        }
      }
    );
  }

  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe(
      (response) => {
        this.archivedUsers = this.archivedUsers.filter(user => user.id !== userId);
        this.applyFilter();
        this.isSuccessDelete = true;
        setTimeout(() => {
          this.isSuccessDelete = false;
        }, 1800);
      },
      (error) => {
        console.error('Error deleting user:', error);
        if (error.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to delete user. Please try again later.';
        }
      }
    );
  }

  deleteOffre(offreId: number): void {
    this.offreService.deleteOffre(offreId).subscribe(
      (response) => {
        this.archivedOffres = this.archivedOffres.filter(offre => offre.id !== offreId);
        this.applyFilter();
        this.isSuccessDelete = true;
        setTimeout(() => {
          this.isSuccessDelete = false;
        }, 1800);
      },
      (error) => {
        console.error('Error deleting offre:', error);
        if (error.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to delete offre. Please try again later.';
        }
      }
    );
  }

  deleteDevis(devisId: number): void {
    this.devisService.deleteDevis(devisId).subscribe({
      next: () => {
        this.archivedDevis = this.archivedDevis.filter(devis => devis.id !== devisId);
        this.applyFilter();
        this.isSuccessDelete = true;
        setTimeout(() => {
          this.isSuccessDelete = false;
        }, 1800);
      },
      error: (err) => {
        console.error('Error deleting devis:', err);
        if (err.status === 401) {
          this.errorMessage = 'Unauthorized: Please log in again.';
        } else {
          this.errorMessage = 'Failed to delete devis. Please try again later.';
        }
      }
    });
  }

  toggleHistorique(devis: any): void {
    this.selectedDevis = devis;
    console.log("devis id", this.selectedDevis.id);
    this.showHistoryModal = true;

    this.devisService.getDevisHistoryByDevisId(this.selectedDevis.id).subscribe({
      next: (history) => {
        this.selectedDevisHistory = history.map((item: any) => ({
          ...item,
          statut: item.statut || item.status || 'N/A',
          comment: item.comment || '-',
          createdAt: item.createdAt,
          filePath: item.filePath,
          originalFileName: item.originalFileName
        }));
        console.log('Devis history:', this.selectedDevisHistory);
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.errorMessage = 'Failed to load history';
        this.selectedDevisHistory = [];
      }
    });
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
    this.selectedDevisHistory = [];
    this.selectedDevis = null;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectOption(option: string): void {
    this.selectedOption = option;
    this.optionSelected.emit(option);
    this.isDropdownOpen = false;
    this.loadArchivedData();
  }

  formatStatus(status: string): string {
    if (!status) return status;
    const statusMap: { [key: string]: string } = {
      'NOUVEAU': 'Nouveau',
      'ACCEPTE': 'Accepté',
      'RAPPEL_RENVOYE': 'Rappel envoyé',
      'AJUSTE_APRES_RECLAMATION': 'Ajusté après réclamation',
      'REFUSE': 'Refusé'
    };
    return statusMap[status] || status.replace(/_/g, ' ');
  }

  formatType(type: string): string {
    switch(type) {
      case 'MAIN_D_OEUVRE':
        return "Main d'œuvre";
      case 'MAIN_D_OEUVRE_ET_MARCHANDISE':
        return "Main d'œuvre & Marchandises";
      default:
        return type;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdownElement = document.querySelector('.dropdown-container');

    if (dropdownElement && !dropdownElement.contains(target)) {
      this.isDropdownOpen = false;
    }
  }
}