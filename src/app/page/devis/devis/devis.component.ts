import { Component, HostListener, OnInit } from '@angular/core';
import { DevisService } from '../../../services/devis/devis.service'; 

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrl: './devis.component.css'
})
export class DevisComponent implements OnInit {
  devis: any[] = [];
  filteredDevis: any[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  devisToDisplay: any[] = [];
  showAddDevisModal = false;
  isSuccess: boolean = false;
  showModifyDevisModal: boolean = false;
  selectedDevis: any = null;
  errorMessage: string = '';
  showArchiveConfirmModal: boolean = false; 
  selectedDevisId: number | null = null; 

  selectedDevisIdToArchive: number | null = null; 
  showSuccessPopup: boolean = false; 
  successMessage: string | null = null;
  isSuccessModified: boolean = false; 

  userRole: string = '';
  canPerformActions: boolean = false;
  
  // Updated: Use 'chantiers' instead of 'offres'
  activeTab: string = 'devis'; 
  statutOptions = [
    { value: 'ACCEPTE', label: 'Accepté' },
    { value: 'EN_NEGOCIATION', label: 'En négociation' },
    { value: 'AJUSTE_APRES_RECLAMATION', label: 'Ajusté après réclamation' },
    { value: 'REFUSE', label: 'Refusé' }];
  selectedStatut: string = 'ALL'; // Default filter

  selectedDevisHistory: any[] = [];
  showHistoryModal: boolean = false;

  showAdjustmentModal: boolean = false;
  showCommentModal: boolean = false;
  
  selectedFile: File | null = null;
  adjustmentComment: string = '';
  isSuccessArchive: boolean = false;
  selectedFileName: string = 'Aucun fichier sélectionné';

  statusOptions = [
    { value: 'ALL', label: 'Tous' },
    { value: 'NOUVEAU', label: 'Nouveau' },
    { value: 'ACCEPTE', label: 'Accepté' },
    { value: 'EN_NEGOCIATION', label: 'En négociation' },
    { value: 'AJUSTE_APRES_RECLAMATION', label: 'Ajusté après réclamation' },
    { value: 'REFUSE', label: 'Refusé' }
  ];

  constructor(private devisService: DevisService) {}

  ngOnInit(): void {
    this.getUserRole();
    this.loadDevis();
  }

  private statusMap: { [key: string]: string } = {
    'NOUVEAU': 'Nouveau',
    'ACCEPTE': 'Accepté',
    'EN_NEGOCIATION': 'En négociation',
    'AJUSTE_APRES_RECLAMATION': 'Ajusté après réclamation',
    'REFUSE': 'Refusé'
  };
  
  getStatusLabel(statut: string): string {
    return this.statusMap[statut] || statut;
  }

  getUserRole(): void {
    const role = localStorage.getItem('user_role');
    this.userRole = role || '';
    this.canPerformActions = this.userRole === 'Administrateur' || this.userRole === 'Chargé commercial';
    console.log("Role in archive:", this.userRole);
    console.log("Can perform actions:", this.canPerformActions);
  }

  getFileIconClass(fileName: string): string {
    if (!fileName) return 'fas fa-file'; // Default to generic file icon

    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return 'fas fa-file-pdf';
      case 'doc':
      case 'docx':
        return 'fas fa-file-word';
      default:
        return 'fas fa-file'; 
    }
  }

  loadDevis(): void {
    this.devisService.getAllActiveDevis().subscribe({
      next: (data) => {
        this.devis = data.map(item => ({
          ...item,
          displayStatus: this.getStatusLabel(item.statut),
          showDropdown: false 
        }));
        console.log("latest devis", this.devis);
        this.filteredDevis = [...this.devis];
        this.updateDevisToDisplay();
      },
      error: (err) => {
        console.error('Error fetching devis:', err);
      }
    });
  }

  filterByStatut(status: string): void {
    this.selectedStatut = status;
    console.log("selected status",status)
    if (status === 'ALL') {
      this.loadDevis();
    } else {
      this.devisService.getActiveDevisByStatus(status).subscribe({
        next: (data) => {
          this.devis = data.map(item => ({
            ...item,
            showDropdown: false // Initialize dropdown state
          }));
          this.filteredDevis = [...this.devis];
          this.updateDevisToDisplay();
        },
        error: (err) => {
          console.error(`Error fetching devis with status ${status}:`, err);
        }
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.status-container')) {
      this.devis.forEach(d => {
        if (d.showDropdown) {
          d.showDropdown = false;
        }
      });
    }
  }

  toggleDropdown(devis: any) {
    this.devis.forEach(d => {
      if (d !== devis && d.showDropdown) {
        d.showDropdown = false;
      }
    });
    devis.showDropdown = !devis.showDropdown;
  }

  toggleHistorique(devis: any): void {
    this.selectedDevis = devis;
    console.log("devis id", this.selectedDevis)
    this.showHistoryModal = true;
    this.devisService.getDevisHistoryByDevisId(devis).subscribe({
      next: (history) => {
        this.selectedDevisHistory = history;
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.errorMessage = 'Failed to load history';
      }
    });
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
    this.selectedDevisHistory = [];
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDevis.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.updateDevisToDisplay();
  }

  updateDevisToDisplay(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.devisToDisplay = this.filteredDevis.slice(startIndex, endIndex);
  }

  openAddOffreModal(): void {
    this.showAddDevisModal = true;
  }

  closeAddDevisModal(): void {
    this.showAddDevisModal = false;
  }

  onDevisAdded(): void {
    this.isSuccess = true;
    this.loadDevis();
    this.closeAddDevisModal();
    setTimeout(() => {
      this.isSuccess = false;
    }, 1900);
  }

  onDevisUpdated(): void {
    this.isSuccessModified = true;
    this.loadDevis(); 
    this.closeModifyDevisModal();
    setTimeout(() => {
      this.isSuccessModified = false;
    }, 1900);
  }

  closeModifyDevisModal(): void {
    this.showModifyDevisModal = false;
    this.selectedDevis = null;
  }

  editDevis(devis: any): void {
    this.errorMessage = ''; 
    this.selectedDevis = { ...devis };
    this.showModifyDevisModal = true;
    console.log('Edit devis:', devis);
    console.log("Edited devis:", this.selectedDevis);
  }

  openArchiveConfirmModal(devis: any): void {
    this.selectedDevis = devis;
    this.selectedDevisIdToArchive = devis.id;
    this.showArchiveConfirmModal = true;
  }

  cancelArchive(): void {
    this.showArchiveConfirmModal = false;
    this.selectedDevis = null;
    this.selectedDevisIdToArchive = null;
  }

  confirmArchive(): void {
    if (this.selectedDevis && this.selectedDevisIdToArchive !== null) {
      this.archiveDevis(this.selectedDevis);
      this.showArchiveConfirmModal = false;
      this.selectedDevisIdToArchive = null;
      this.selectedDevis = null;
    }
  }

  archiveDevis(devis: any): void {
    if (devis.id) {
      this.devisService.archiveDevis(devis.id).subscribe({
        next: () => { 
          this.devis = this.devis.filter(d => d.id !== devis.id); 
          this.filteredDevis = this.filteredDevis.filter(d => d.id !== devis.id); 
          console.log(`Archived devis with ID: ${devis.id}`);
          this.loadDevis();
          this.showSuccessMessage('Le devis a été archivé avec succès!');
          this.errorMessage = '';
          this.updateDevisToDisplay();
          this.isSuccessArchive = true;
          console.log('isSuccessArchive set to true (success callback)');
          setTimeout(() => {
            this.isSuccessArchive = false;
            console.log('isSuccessArchive set to false (success callback)');
          }, 1500);
        },
        error: (err) => {
          console.error('Error archiving devis:', err);
          this.errorMessage = 'Échec de l\'archivage du devis. Veuillez réessayer.';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
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

  openAdjustmentModal(devis: any): void {
    this.selectedDevis = devis;
    this.showAdjustmentModal = true;
    this.resetForm();
  }

  openCommentModal(devis: any): void {
    this.selectedDevis = devis;
    this.showCommentModal = true;
    this.resetForm();
  }

  closeAdjustmentModal(): void {
    this.showAdjustmentModal = false;
    this.showCommentModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.adjustmentComment = '';
    this.selectedFile = null;
    this.selectedFileName = 'Aucun fichier sélectionné';
    this.errorMessage = '';
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(fileExt)) {
        this.errorMessage = 'Seuls les documents PDF et Word (.pdf, .doc, .docx) sont autorisés';
        this.selectedFile = null;
        this.selectedFileName = 'Aucun fichier sélectionné';
        return;
      }
      this.selectedFile = file;
      this.selectedFileName = file.name;
      console.log(this.selectedFile)
    } else {
      this.selectedFileName = 'Aucun fichier sélectionné';
    }
  }

  submitAdjustment(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier';
      return;
    }
    if (!this.adjustmentComment) {
      this.errorMessage = 'Veuillez ajouter un commentaire';
      return;
    }
    const fileToUpload = this.selectedFile;
    this.devisService.updateDevisStatus(this.selectedDevis.id, 'AJUSTE_APRES_RECLAMATION')
      .subscribe({
        next: (updatedDevis) => {
          this.devisService.addDevisHistory(
            fileToUpload,
            this.selectedDevis.id,
            this.adjustmentComment
          ).subscribe({
            next: (response) => {
              const index = this.devis.findIndex(d => d.id === this.selectedDevis.id);
              if (index !== -1) {
                this.devis[index].statut = 'AJUSTE_APRES_RECLAMATION';
                this.filteredDevis = [...this.devis];
                this.updateDevisToDisplay();
                this.loadDevis();
              }
              this.closeAdjustmentModal();
              this.resetForm();
            },
            error: (err) => {
              console.error('Error submitting adjustment:', err);
              this.errorMessage = err.message || 'Une erreur est survenue lors de la soumission de l\'ajustement';
            }
          });
        },
        error: (err) => {
          console.error('Error updating status:', err);
          this.errorMessage = 'Échec de la mise à jour du statut. Veuillez réessayer.';
        }
      });
  }


  submitComment(): void {
   
    if (!this.adjustmentComment) {
      this.errorMessage = 'Veuillez ajouter un commentaire';
      return;
    }

    let fileToUpload: File | null = null;
    
    this.devisService.updateDevisStatus(this.selectedDevis.id, 'EN_NEGOCIATION')
      .subscribe({
        next: (updatedDevis) => {
          this.devisService.addDevisHistory(
            fileToUpload,
            this.selectedDevis.id,
            this.adjustmentComment
          ).subscribe({
            next: (response) => {
              const index = this.devis.findIndex(d => d.id === this.selectedDevis.id);
              if (index !== -1) {
                this.devis[index].statut = 'EN_NEGOCIATION';
                this.filteredDevis = [...this.devis];
                this.updateDevisToDisplay();
                this.loadDevis();
              }
              this.closeAdjustmentModal();
              this.resetForm();
            },
            error: (err) => {
              console.error('Error submitting adjustment:', err);
              this.errorMessage = err.message || 'Une erreur est survenue lors de la soumission de l\'ajustement';
            }
          });
        },
        error: (err) => {
          console.error('Error updating status:', err);
          this.errorMessage = 'Échec de la mise à jour du statut. Veuillez réessayer.';
        }
      });
  }



  downloadFile(devisId: number, fileName: string): void {
    this.devisService.downloadDevisFile(devisId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.style.display = 'none';
        a.target = '_self';
        a.download = fileName || 'devis-document';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Error downloading file:', err);
        this.errorMessage = 'Failed to download file';
      }
    });
  }

  updateDevisStatus(devis: any, newStatus: string): void {
    devis.showDropdown = false;
    if (newStatus === 'AJUSTE_APRES_RECLAMATION') {
      this.openAdjustmentModal(devis);
      return;
    } else if (newStatus === 'EN_NEGOCIATION') {
      this.openCommentModal(devis);
      return;
    }
   
    this.devisService.updateDevisStatus(devis.id, newStatus).subscribe({
      next: (updatedDevis) => {
        const index = this.devis.findIndex(d => d.id === devis.id);
        if (index !== -1) {
          this.devis[index].statut = newStatus;
          this.filteredDevis = [...this.devis];
          this.updateDevisToDisplay();
        }
      },
      error: (err) => {
        console.error('Error updating devis status:', err);
        this.errorMessage = 'Échec de la mise à jour du statut. Veuillez réessayer.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }
}