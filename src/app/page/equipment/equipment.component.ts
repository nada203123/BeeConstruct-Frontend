import { Component, OnInit } from '@angular/core';
import { EquipmentService, Equipment } from '../../services/equipment/equipment.service';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.css']
})
export class EquipmentComponent implements OnInit {
  equipmentList: Equipment[] = [];
  allEquipment: Equipment[] = [];
  filteredEquipment: Equipment[] = [];
  equipmentToDisplay: Equipment[] = [];
  searchTerm: string = '';
  showAddPopup: boolean = false;
  showModifyPopup: boolean = false;
  showSuccessPopup: boolean = false;
  showArchiveConfirmModal: boolean = false;
  selectedEquipment: Equipment | null = null;
  equipmentToArchive: Equipment | null = null;
  originalEquipment: Equipment | null = null;
  newEquipment: Equipment = { name: '', quantity: 0 };
  successMessage: string | null = null;
  errorMessage: string | null = null;
  currentPage: number = 1;
  totalPages: number = 1;
  equipmentPerPage: number = 5;

  userRole: string = '';
  canPerformActions: boolean = false;

  constructor(private equipmentService: EquipmentService) {}

  ngOnInit(): void {
    this.getUserRole();
    this.loadActiveEquipment();
    this.loadAllEquipment();
  }

  getUserRole(): void {
    const role = localStorage.getItem('user_role');
    this.userRole = role || '';
    this.canPerformActions = this.userRole === 'Administrateur' || this.userRole === 'Chargé commercial';
    console.log("Role in archive:", this.userRole);
    console.log("Can perform actions:", this.canPerformActions);
  }

  loadActiveEquipment(): void {
    this.equipmentService.getAllActiveEquipment().subscribe({
      next: (data) => {
        this.equipmentList = data;
        this.filteredEquipment = data;
        this.updatePagination();
        this.errorMessage = null;
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors du chargement des équipements actifs.');
      }
    });
  }

  loadAllEquipment(): void {
    this.equipmentService.getAllEquipment().subscribe({
      next: (data) => {
        this.allEquipment = data;
        this.updatePagination();
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors du chargement de tous les équipements.');
      }
    });
  }

  searchEquipment(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredEquipment = this.equipmentList;
    } else {
      this.filteredEquipment = this.equipmentList.filter(equipment =>
        equipment.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredEquipment.length / this.equipmentPerPage));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.equipmentPerPage;
    const endIndex = startIndex + this.equipmentPerPage;
    this.equipmentToDisplay = this.filteredEquipment.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  openAddPopup(): void {
    this.newEquipment = { name: '', quantity: 0 };
    this.errorMessage = null;
    this.showAddPopup = true;
  }

  closeAddPopup(): void {
    this.showAddPopup = false;
    this.errorMessage = null;
  }

  addEquipment(): void {
    if (!this.newEquipment.name.trim()) {
      this.showErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    this.equipmentService.getAllEquipment().subscribe({
      next: (allEquipment) => {
        const nameExists = allEquipment.some(
          equipment => equipment.name.toLowerCase() === this.newEquipment.name.trim().toLowerCase()
        );
        if (nameExists) {
          this.showErrorMessage('Un équipement avec ce nom existe déjà.');
          return;
        }

        this.equipmentService.createEquipment(this.newEquipment).subscribe({
          next: (equipment) => {
            this.equipmentList.push(equipment);
            this.allEquipment.push(equipment);
            this.filteredEquipment = this.equipmentList;
            this.showAddPopup = false;
            this.showSuccessMessage('Équipement ajouté avec succès.');
            this.errorMessage = null;
            this.updatePagination();
          },
          error: (err) => {
            this.handleError(err, 'Erreur lors de l\'ajout de l\'équipement.');
          }
        });
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors de la vérification des équipements existants.');
      }
    });
  }

  openModifyPopup(equipment: Equipment): void {
    this.selectedEquipment = { ...equipment };
    this.originalEquipment = { ...equipment };
    this.errorMessage = null;
    this.showModifyPopup = true;
  }

  closeModifyPopup(): void {
    this.showModifyPopup = false;
    this.selectedEquipment = null;
    this.originalEquipment = null;
    this.errorMessage = null;
  }

  updateEquipment(): void {
    if (!this.selectedEquipment || !this.originalEquipment) return;

    if (!this.selectedEquipment.name.trim()) {
      this.showErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    if (
      this.selectedEquipment.name.trim().toLowerCase() === this.originalEquipment.name.trim().toLowerCase() &&
      this.selectedEquipment.quantity === this.originalEquipment.quantity
    ) {
      this.showErrorMessage('Aucune modification n\'a été effectuée.');
      return;
    }

    this.equipmentService.getAllEquipment().subscribe({
      next: (allEquipment) => {
        const nameExists = allEquipment.some(
          equipment =>
            equipment.id !== this.selectedEquipment!.id &&
            equipment.name.toLowerCase() === this.selectedEquipment!.name.trim().toLowerCase()
        );
        if (nameExists) {
          this.showErrorMessage('Un équipement avec ce nom existe déjà.');
          return;
        }

        if (this.selectedEquipment!.id) {
          this.equipmentService.updateEquipment(this.selectedEquipment!.id, this.selectedEquipment!).subscribe({
            next: (updatedEquipment) => {
              const index = this.equipmentList.findIndex(e => e.id === updatedEquipment.id);
              if (index !== -1) {
                this.equipmentList[index] = updatedEquipment;
              }
              const allIndex = this.allEquipment.findIndex(e => e.id === updatedEquipment.id);
              if (allIndex !== -1) {
                this.allEquipment[allIndex] = updatedEquipment;
              }
              this.filteredEquipment = this.equipmentList;
              this.showModifyPopup = false;
              this.showSuccessMessage('Équipement modifié avec succès.');
              this.errorMessage = null;
              this.updatePagination();
            },
            error: (err) => {
              this.handleError(err, 'Erreur lors de la modification de l\'équipement.');
            }
          });
        }
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors de la vérification des équipements existants.');
      }
    });
  }

  incrementQuantity(equipment: Equipment): void {
    if (equipment.id) {
      const updatedEquipment = { ...equipment, quantity: equipment.quantity + 1 };
      this.equipmentService.updateEquipment(equipment.id, updatedEquipment).subscribe({
        next: (updated) => {
          equipment.quantity = updated.quantity;
          const allIndex = this.allEquipment.findIndex(e => e.id === updated.id);
          if (allIndex !== -1) {
            this.allEquipment[allIndex] = updated;
          }
          this.errorMessage = null;
          this.updatePagination();
          // Removed: this.showSuccessMessage('Quantité mise à jour avec succès.');
        },
        error: (err) => {
          this.handleError(err, 'Erreur lors de la mise à jour de la quantité.');
        }
      });
    }
  }

  decrementQuantity(equipment: Equipment): void {
    if (equipment.quantity <= 0) {
      this.showErrorMessage('La quantité ne peut pas être inférieure à 0.');
      return;
    }
  
    if (equipment.id) {
      const updatedEquipment = { ...equipment, quantity: equipment.quantity - 1 };
      this.equipmentService.updateEquipment(equipment.id, updatedEquipment).subscribe({
        next: (updated) => {
          equipment.quantity = updated.quantity;
          const allIndex = this.allEquipment.findIndex(e => e.id === updated.id);
          if (allIndex !== -1) {
            this.allEquipment[allIndex] = updated;
          }
          this.errorMessage = null;
          this.updatePagination();
          // Removed: this.showSuccessMessage('Quantité mise à jour avec succès.');
        },
        error: (err) => {
          this.handleError(err, 'Erreur lors de la mise à jour de la quantité.');
        }
      });
    }
  }

  updateQuantity(equipment: Equipment): void {
    if (equipment.quantity < 0) {
      this.showErrorMessage('La quantité ne peut pas être inférieure à 0.');
      equipment.quantity = 0;
      return;
    }
  
    if (equipment.id) {
      this.equipmentService.updateEquipment(equipment.id, equipment).subscribe({
        next: (updated) => {
          equipment.quantity = updated.quantity;
          const allIndex = this.allEquipment.findIndex(e => e.id === updated.id);
          if (allIndex !== -1) {
            this.allEquipment[allIndex] = updated;
          }
          this.errorMessage = null;
          this.updatePagination();
          // Removed: this.showSuccessMessage('Quantité mise à jour avec succès.');
        },
        error: (err) => {
          this.handleError(err, 'Erreur lors de la mise à jour de la quantité.');
        }
      });
    }
  }

  updateQuantityAndBlur(event: Event, equipment: Equipment): void {
    this.updateQuantity(equipment);
    const inputElement = event.target as HTMLInputElement;
    inputElement.blur();
  }

  openArchiveConfirmModal(equipment: Equipment): void {
    this.equipmentToArchive = equipment;
    this.showArchiveConfirmModal = true;
  }

  cancelArchive(): void {
    this.showArchiveConfirmModal = false;
    this.equipmentToArchive = null;
  }

  confirmArchive(): void {
    if (this.equipmentToArchive) {
      this.archiveEquipment(this.equipmentToArchive);
      this.showArchiveConfirmModal = false;
      this.equipmentToArchive = null;
    }
  }

  archiveEquipment(equipment: Equipment): void {
    if (equipment.id) {
      this.equipmentService.archiveEquipment(equipment.id).subscribe({
        next: (archivedEquipment) => {
          this.equipmentList = this.equipmentList.filter(e => e.id !== archivedEquipment.id);
          this.filteredEquipment = this.filteredEquipment.filter(e => e.id !== archivedEquipment.id);
          const index = this.allEquipment.findIndex(e => e.id === archivedEquipment.id);
          if (index !== -1) {
            this.allEquipment[index] = archivedEquipment;
          }
          this.showSuccessMessage('Équipement archivé avec succès.');
          this.errorMessage = null;
          this.updatePagination();
        },
        error: (err) => {
          this.handleError(err, 'Erreur lors de l\'archivage de l\'équipement.');
        }
      });
    }
  }

  private handleError(err: any, defaultMessage: string): void {
    console.error('Erreur:', err);
    console.log('Détails de l\'erreur:', {
      status: err.status,
      statusText: err.statusText,
      error: err.error,
      message: err.message
    });

    const status = Number(err.status);

    if (status === 409) {
      this.showErrorMessage('Un équipement avec ce nom existe déjà.');
    } else if (status === 400) {
      if (defaultMessage.includes('archivage')) {
        this.showErrorMessage('L\'équipement est déjà archivé.');
      } else {
        this.showErrorMessage('La quantité ne peut pas être négative.');
      }
    } else if (status === 404) {
      this.showErrorMessage('Équipement non trouvé.');
    } else if (status === 405) {
      this.showErrorMessage('Méthode non autorisée. Veuillez vérifier l\'API.');
    } else {
      this.showErrorMessage(defaultMessage);
    }
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccessPopup = true;
    setTimeout(() => {
      this.showSuccessPopup = false;
      this.successMessage = null;
    }, 1800);
  }

  showErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
  }
}