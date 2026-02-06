import { Component, HostListener, OnInit } from '@angular/core';
import { OffreService } from '../../../services/offres/offre.service';
import { catchError, forkJoin, map, Observable, of, timeout } from 'rxjs';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WebSocketNotificationService } from '../../../services/web-socket-notification.service';

interface HistoriqueItem {
  id: number;
  createdAt: string; // or Date if you're using Date objects
  comment: string;
  filePath?: string;
  originalFileName?: string;
  showFullComment: boolean; // Changed to required boolean
}

@Component({
  selector: 'app-offre',
  templateUrl: './offre.component.html',
  styleUrl: './offre.component.css'
})

export class OffreComponent implements OnInit {
  offres: any[] = [];
  clientNames: { [key: number]: string } = {};
  currentPage = 1;
  itemsPerPage = 4;
  offresToDisplay: any[] = [];
  filteredOffres: any[] = [];
  searchQuery: string = '';
  selectedClient: any = null;
  showClientModal: boolean = false;
  showAddOffreModal = false;
  activeTab: string = 'Chantiers en prospection'; 
  isSuccess: boolean = false;
  selectedOffreId: number | null = null; 
  showArchiveConfirmModal: boolean = false; 
  isSuccessArchive: boolean = false;
  errorMessage: string = '';
  showModifyOffreModal: boolean = false;
  selectedOffre: any = null;
  isSuccessModified: boolean = false;
  refreshFilters = 0;
  canPerformActions: boolean = false;
  userRole: string = '';
  showAdjustmentModal: boolean = false;
  selectedFile: File | null = null;
  adjustmentComment: string = '';
  selectedFileName: string = 'Aucun fichier sélectionné';
  showCommentModal: boolean = false;
  isSuccessEvent: boolean = false; // Added for event success popup

  showHistoryModal: boolean = false;
  selectedOffreHistory: HistoriqueItem[] = []; // Type updated to include HistoriqueItem

  highlightedOffres: { [key: number]: boolean } = {};

  statutOptions = [
    { value: 'EN_ATTENTE_DE_DEVIS', label: 'En attente de devis' },
    { value: 'REFUSEE', label: 'Refusé' },
    { value: 'ACCEPTEE', label: 'Accepté' }
  ];
  selectedStatut: string = 'ALL'; // Default filter
  private stompClient!: Client; 

  constructor(private offreService: OffreService,
    private notificationService: WebSocketNotificationService
  ) { 
  }
  
  ngOnInit(): void {
    this.getUserRole();
    this.loadOffres();
    this.notificationService.initializeWebSocketConnection();
    this.onCheckStaleOffres();
  }
  
  ngOnDestroy(): void {
    this.disconnectWebSocket();
  }
  
  onCheckStaleOffres() {
    this.offreService.checkStaleOffres().subscribe({
      next: (response) => {
        console.log('Réponse du backend:', response);
      },
      error: (err) => {
        console.error('Erreur :', err);
      }
    });
  }
   

  private disconnectWebSocket(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
    
  formatDateFR(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // mois indexé à 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
    
  get totalPages(): number {
    return Math.ceil(this.filteredOffres.length / this.itemsPerPage);
  }

  openAddOffreModal(): void {
    this.showAddOffreModal = true;
  }

  closeAddOffreModal(): void {
    this.showAddOffreModal = false;
  }

  loadOffresForPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.offresToDisplay = this.filteredOffres.slice(startIndex, endIndex);
    console.log(this.offresToDisplay);
  }

  loadOffres(): void {
    this.offreService.getAllActiveOffres().subscribe({
      next: (data) => {
        this.offres = data;
        console.log(data);
        this.loadClientNames();
        this.applyFilter();

        this.offres.forEach(offre => {
          this.checkHistoriqueDate(offre.id);
        });
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }

  loadClientNames(): void {
    const requests = this.offres.map(offre => 
      this.offreService.getClientName(offre.id).pipe(
        map(client => ({
          offreId: offre.id,
          fullName: `${client.nomSociete}`
        }))
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        results.forEach(result => {
          this.clientNames[result.offreId] = result.fullName;
        });
        this.applyFilter(); 
      },
      error: (err) => {
        console.error('Error fetching client names:', err);
        this.applyFilter(); 
      }
    });
  }

  getClientName(offreId: number): string {
    return this.clientNames[offreId] || '';
  }

  onFilterApplied(filters: any): void {
    if (!filters) {
      this.loadOffres();
      return;
    }
    
    this.offreService.searchOffres(
      filters.clientId, 
      filters.localisation, 
      filters.statut,
      filters.type,
      filters.dateCreation
    ).subscribe(
      (data) => {
        this.offres = data;
        console.log("offres of filter", this.offres);
        this.loadClientNames();
        this.currentPage = 1;
        this.filteredOffres = [...this.offres];
        this.loadOffresForPage();
      },
      (error) => {
        console.error('Error applying filters:', error);
      }
    );
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
    this.loadOffresForPage();
  }

  search(): void {
    this.currentPage = 1; 
    this.applyFilter();
  }

  applyFilter(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredOffres = [...this.offres];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredOffres = this.offres.filter(offre => 
        offre.titre?.toLowerCase().includes(query) ||
        this.getClientName(offre.id)?.toLowerCase().includes(query) ||
        offre.localisation?.toLowerCase().includes(query) ||
        this.formatStatus(offre.statutOffre)?.toLowerCase().includes(query) ||
        this.formatType(offre.type)?.toLowerCase().includes(query)
      );
    }
    this.loadOffresForPage();
  }

  formatStatus(status: string): string {
    const option = this.statutOptions.find(opt => opt.value === status);
    return option ? option.label : status.replace(/_/g, ' ');
  }

  showClientDetails(offreId: number): void {
    this.offreService.getClientName(offreId).subscribe({
      next: (clientInfo) => {
        this.selectedClient = clientInfo;
        this.showClientModal = true;
      },
      error: (err) => {
        console.error('Error fetching client details:', err);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onOffreAdded(): void {
    this.isSuccess = true;
    this.loadOffres();
    this.closeAddOffreModal();
    setTimeout(() => {
      this.isSuccess = false;
    }, 1500);
  }

  openArchiveConfirmModal(userId: number): void {
    this.selectedOffreId = userId;
    this.showArchiveConfirmModal = true;
  }

  confirmArchive(): void {
    if (this.selectedOffreId) {
      this.archiveOffre(this.selectedOffreId);
      this.showArchiveConfirmModal = false; 
      this.selectedOffreId = null; 
      this.onCheckStaleOffres();
    }
  }

  cancelArchive(): void {
    this.showArchiveConfirmModal = false; 
    this.selectedOffreId = null; 
  }

  archiveOffre(offreId: number): void {
    console.log('archiveClient called with clientId:', offreId);
    this.offreService.archiveOffre(offreId).subscribe(
      (response) => {
        console.log('Client archived successfully, response:', response);
        this.offres = this.offres.map(offre => 
          offre.id === offreId ? {...offre, archived: true} : offre
        );
        this.loadOffresForPage();
        this.loadOffres();
        this.isSuccessArchive = true;
        console.log('isSuccessArchive set to true (success callback)');
        setTimeout(() => {
          this.isSuccessArchive = false;
          console.log('isSuccessArchive set to false (success callback)');
        }, 1500);
      },
      (error) => {
        console.error('Error archiving client:', error);
      }
    );
  }

  editOffre(offreId: number): void {
    this.errorMessage = ''; 
    const offre = this.offres.find(u => u.id === offreId);
    if (offre) {
      this.selectedOffre = { ...offre };
      this.showModifyOffreModal = true;
      console.log('Edit offre:', offreId);
      console.log("edited offre", this.selectedOffre);
    } else {
      console.error('offre not found with Id:', offreId);
    }
  }

  closeModifyOffreModal(): void {
    this.showModifyOffreModal = false;
    this.selectedOffre = null;
  }

  updateOffre(): void {
    this.isSuccessModified = true;
    this.loadOffres();
    this.closeModifyOffreModal();
    this.refreshFilters++;
    setTimeout(() => {
      this.isSuccessModified = false;
    }, 1500);
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

  uploadFile(event: any, offreId: number): void {
    console.log('uploadFile called with offreId:', offreId);
    const file = event.target.files[0];
    if (file) {
      console.log('File uploaded:', file.name);
    }
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

  downloadFile(offreId: number, fileName: string): void {
    this.offreService.downloadDevisFile(offreId).subscribe({
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

  openAdjustmentModal(offre: any): void {
    this.selectedOffre = offre;
    this.showHistoryModal = false;
    this.showAdjustmentModal = true;
    this.resetForm();
  }

  resetForm(): void {
    this.adjustmentComment = '';
    this.selectedFile = null;
    this.selectedFileName = 'Aucun fichier sélectionné';
    this.errorMessage = '';
  }

  closeAdjustmentModal(): void {
    this.showAdjustmentModal = false;
    this.showCommentModal = false;
    this.resetForm();
  }

  submitAdjustment(): void {
    if (!this.adjustmentComment) {
      this.errorMessage = 'Veuillez ajouter un commentaire';
      return;
    }

    console.log(this.selectedOffre);
    const fileToUpload = this.selectedFile;
    this.offreService.addHistory(fileToUpload,
      this.selectedOffre,
      this.adjustmentComment)
      .subscribe({
        next: () => {
          this.showAdjustmentModal = false;
          this.resetForm();
          this.loadOffres();
          this.checkHistoriqueDate(this.selectedOffre.id);
          this.isSuccessEvent = true;
          setTimeout(() => {
            this.isSuccessEvent = false;
          }, 1500);
        },
        error: (err) => {
          console.error('Error updating status:', err);
          this.errorMessage = "Échec lors de l'ajout d'un événement. Veuillez réessayer.";
        }
      });
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
      console.log(this.selectedFile);
    } else {
      this.selectedFileName = 'Aucun fichier sélectionné';
    }
  }

  toggleDropdown(offre: any) {
    this.offres.forEach(d => {
      if (d !== offre && d.showDropdown) {
        d.showDropdown = false;
      }
    });
    offre.showDropdown = !offre.showDropdown;
  }

  updateOffreStatus(offre: any, newStatus: string): void {
    if (offre.showDropdown !== undefined) {
      offre.showDropdown = false;
    }
    this.offreService.updateOffreStatus(offre.id, newStatus).subscribe({
      next: (updatedOffre) => {
        const index = this.offres.findIndex(o => o.id === offre.id);
        if (index !== -1) {
          this.offres[index].statutOffre = newStatus;
          
          if (this.filteredOffres) {
            this.filteredOffres = [...this.offres];
          }
        }
      },
      error: (err) => {
        console.error('Error updating offre status:', err);
        this.errorMessage = 'Échec de la mise à jour du statut. Veuillez réessayer.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.status-container')) {
      this.offres.forEach(d => {
        if (d.showDropdown) {
          d.showDropdown = false;
        }
      });
    }
  }

  toggleHistorique(offreId: number): void {
    this.selectedOffreId = offreId;
    console.log("offre id", this.selectedOffreId);
    this.showHistoryModal = true;
    this.offreService.getHistoryByOffreId(offreId).subscribe({
      next: (history) => {
        this.selectedOffreHistory = history.map((item: HistoriqueItem) => ({
          ...item,
          showFullComment: item.comment.length <= 50 // Initialize based on comment length
        }));
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.errorMessage = 'Failed to load history';
      }
    });
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
    this.selectedOffreHistory = [];
  }

  checkHistoriqueDate(offreId: number): void {
    this.offreService.getHistoryByOffreId(offreId).subscribe({
      next: (history: HistoriqueItem[]) => {
        if (history && history.length > 0) {
          history.sort((a: HistoriqueItem, b: HistoriqueItem) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const lastUpdate = new Date(history[0].createdAt);
          const now = new Date();
          const diffInDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
          this.highlightedOffres[offreId] = diffInDays > 30;
          if (diffInDays > 1) {
            this.notificationService.sendStaleNotification(offreId);
          }
        } else {
          this.highlightedOffres[offreId] = false;
        }
      },
      error: (err) => {
        console.error('Error checking historique date:', err);
        this.highlightedOffres[offreId] = false;
      }
    });
  }

  toggleComment(item: HistoriqueItem): void {
    if (item.comment.length > 50) { // Only toggle if comment exceeds 50 characters
      item.showFullComment = !item.showFullComment;
    }
  }
}