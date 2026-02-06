import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarchandiseService } from '../../services/marchandises/marchandise.service';
import { ChantierService } from '../../services/chantier/chantier.service';
import { Commande } from '../../models/commande.model';
import { Situation } from '../../models/Situation.model';
import { SituationService } from '../../services/situation/situation.service';

@Component({
  selector: 'app-marchandises',
  templateUrl: './marchandises.component.html',
  styleUrls: ['./marchandises.component.css']
})
export class MarchandisesComponent implements OnInit {
  @ViewChild('situationScroll') situationScroll!: ElementRef;
  chantierId: number | null = null;
  chantierTitre: string = '';
  commandes: Commande[] = [];
  commandesToDisplay: Commande[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 4;
  showDeleteConfirmModal: boolean = false;
  selectedCommandeId: number | null = null;
  isSuccessDelete: boolean = false;
  isSuccessAdd: boolean = false;
  isSuccessModified: boolean = false;
  totalTTC: number = 0;
  showAddCommandeModal: boolean = false;
  showModifyCommandeModal: boolean = false;
  selectedCommande: Commande | null = null;
  expandedTooltip: number | null = null;
  selectedSituationId: number | null = null;
  situations: Situation[] = [];
  isLoadingSituations: boolean = false;
  addCommandeError: string | null = null; // Holds the error message

  constructor(
    private route: ActivatedRoute,
    private marchandiseService: MarchandiseService,
    private chantierService: ChantierService,
    private situationService: SituationService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chantierId = +id;
      this.loadChantierDetails();
      this.loadSituations();
      this.loadCommandes();
      this.loadTotalTTC();
    }
  }

  loadChantierDetails(): void {
    if (this.chantierId) {
      this.chantierService.getChantierById(this.chantierId).subscribe({
        next: (data) => {
          this.chantierTitre = data.titre || 'Unknown Chantier';
        },
        error: (err) => {
          console.error('Error fetching chantier details:', err);
          this.chantierTitre = 'Error Loading Chantier';
        }
      });
    }
  }

  loadSituations(): void {
    if (this.chantierId) {
      this.isLoadingSituations = true;
      this.situationService.getSituationByChantierId(this.chantierId).subscribe({
        next: (situations: Situation[]) => {
          this.situations = situations;
          console.log('Loaded situations:', this.situations); // Debug log
          this.isLoadingSituations = false;
        },
        error: (err) => {
          console.error('Failed to load situations:', err);
          this.situations = [];
          this.isLoadingSituations = false;
        }
      });
    }
  }

  onSituationChange(situationId: number): void {
  this.selectedSituationId = +situationId || null;
  this.loadCommandes();
   this.loadTotalTTC();
}

 




  getSituationNom(situationId: number | null | undefined): string {
  if (!situationId) {
    return '-';
  }
  const situation = this.situations.find(s => s.id === situationId);
  return situation ? situation.nomSituation : '-';
}


  

  loadCommandes(): void {
    if (this.chantierId && this.selectedSituationId) {
      this.marchandiseService.getCommandesByChantierIdAndSituationId(this.chantierId, this.selectedSituationId).subscribe({
        next: (commandes) => {
          this.commandes = commandes.sort((a, b) => {
            const dateA = new Date(a.dateCommande);
            const dateB = new Date(b.dateCommande);
            return dateB.getTime() - dateA.getTime();
          });
          this.currentPage = 1;
          this.loadCommandesForPage();
        },
        error: (err) => {
          console.error('Failed to load commandes:', err);
          this.commandes = []; // Reset to empty array on error
          this.loadCommandesForPage();
        }
      });
    } else if (this.chantierId) {
      this.marchandiseService.getCommandesByChantierIdAndSituationId(this.chantierId, null).subscribe({
        next: (commandes) => {
          this.commandes = commandes.sort((a, b) => {
            const dateA = new Date(a.dateCommande);
            const dateB = new Date(b.dateCommande);
            return dateB.getTime() - dateA.getTime();
          });
          this.currentPage = 1;
          this.loadCommandesForPage();
        },
        error: (err) => {
          console.error('Failed to load commandes:', err);
          this.commandes = []; // Reset to empty array on error
          this.loadCommandesForPage();
        }
      });
    }
  }

loadTotalTTC(): void {
  if (this.chantierId) {
    if (this.selectedSituationId) {
      this.marchandiseService.getTotalTTCByChantierIdAndSituationId(this.chantierId, this.selectedSituationId).subscribe({
        next: (total) => {
          this.totalTTC = total;
        },
        error: (err) => console.error('Failed to load total TTC by situation:', err)
      });
    } else {
      this.marchandiseService.getTotalTTCByChantierId(this.chantierId).subscribe({
        next: (total) => {
          this.totalTTC = total;
        },
        error: (err) => console.error('Failed to load total TTC:', err)
      });
    }
  }
}


  loadCommandesForPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.commandesToDisplay = this.commandes.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadCommandesForPage();
  }

  get totalPages(): number {
    return Math.ceil(this.commandes.length / this.itemsPerPage);
  }

  openDeleteConfirmModal(id: number | undefined): void {
    if (id !== undefined) {
      this.selectedCommandeId = id;
      this.showDeleteConfirmModal = true;
    }
  }

  confirmDelete(): void {
    if (this.selectedCommandeId) {
      this.marchandiseService.deleteCommande(this.selectedCommandeId).subscribe({
        next: () => {
          this.loadCommandes();
          this.loadTotalTTC();
          this.showDeleteConfirmModal = false;
          this.selectedCommandeId = null;
          this.isSuccessDelete = true;
          setTimeout(() => {
            this.isSuccessDelete = false;
          }, 1800);
        },
        error: (err) => {
          console.error('Failed to delete commande:', err);
          this.showDeleteConfirmModal = false;
          this.selectedCommandeId = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirmModal = false;
    this.selectedCommandeId = null;
  }

  openAddCommandeModal(): void {
    this.addCommandeError = null; 
    this.showAddCommandeModal = true;
  }

  closeAddCommandeModal(): void {
    this.addCommandeError = null; 
    this.showAddCommandeModal = false;
  }

  openModifyCommandeModal(commande: Commande): void {
    this.selectedCommande = commande;
    this.showModifyCommandeModal = true;
  }

  closeModifyCommandeModal(): void {
    this.showModifyCommandeModal = false;
    this.selectedCommande = null;
  }

  addCommande(newCommande: Commande): void {
    if (this.chantierId) {
      this.marchandiseService.addCommande(newCommande).subscribe({
        next: () => {
          this.loadCommandes();
          this.loadTotalTTC();
          this.closeAddCommandeModal();
          this.addCommandeError = null; // Clear error on success
          this.isSuccessAdd = true;
          setTimeout(() => {
            this.isSuccessAdd = false;
          }, 1800);
        },
        error: (err) => {
          console.log('Full error:', err); 
          console.error('Failed to add commande:', err);
          let errorMessage = 'Une erreur est survenue lors de l\'ajout de la commande.';
          if (err.error && typeof err.error === 'object' && err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error) {
            errorMessage = err.error.toString();
          }
          // Only set error if it's a new validation failure
          if (errorMessage.includes('Date de commande must be in the same month as the situation')) {
            errorMessage = 'La date de commande doit être dans le même mois que la situation.';
            this.addCommandeError = errorMessage;
          } else if (errorMessage.includes('Chantier ID is required')) {
            this.addCommandeError = 'L\'ID du chantier est requis.';
          } else if (errorMessage.includes('Nom du fournisseur is required')) {
            this.addCommandeError = 'Le nom du fournisseur est requis.';
          } else if (errorMessage.includes('Prix HT must be greater than 0')) {
            this.addCommandeError = 'Le prix HT doit être supérieur à 0.';
          } else if (errorMessage.includes('TVA must be between 5% and 20%')) {
            this.addCommandeError = 'La TVA doit être entre 5 % et 20 %.';
          } else if (errorMessage.includes('Date de commande is required')) {
            this.addCommandeError = 'La date de commande est requise.';
          } else if (errorMessage.includes('Situation not found')) {
            this.addCommandeError = 'La situation spécifiée n\'a pas été trouvée.';
          } else {
            this.addCommandeError = errorMessage;
          }
        }
      });
    }
  }

  updateCommande(updatedCommande: Commande): void {
    if (updatedCommande.id && this.chantierId) {
      this.marchandiseService.updateCommande(updatedCommande.id, updatedCommande).subscribe({
        next: () => {
          this.loadCommandes();
          this.loadTotalTTC();
          this.closeModifyCommandeModal();
          this.isSuccessModified = true;
          setTimeout(() => {
            this.isSuccessModified = false;
          }, 1800);
        },
        error: (err) => console.error('Failed to update commande:', err)
      });
    }
  }

  toggleTooltip(id: number | undefined, event: Event): void {
    event.stopPropagation();
    if (id !== undefined) {
      this.expandedTooltip = this.expandedTooltip === id ? null : id;
    }
  }

  closeTooltip(id: number | undefined, event: Event): void {
    event.stopPropagation();
    if (id !== undefined && this.expandedTooltip === id) {
      this.expandedTooltip = null;
    }
  }

  prevSituation(): void {
    if (this.situationScroll) {
      this.situationScroll.nativeElement.scrollLeft -= 120;
    }
  }

  nextSituation(): void {
    if (this.situationScroll) {
      this.situationScroll.nativeElement.scrollLeft += 120;
    }
  }


  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInsideArrow = target.closest('.tooltip-arrow');
    const clickedInsideTooltip = target.closest('.tooltip');
    if (!clickedInsideArrow && !clickedInsideTooltip && this.expandedTooltip !== null) {
      this.expandedTooltip = null;
    }
  }

  // New method to handle child form validity
  onFormValid(valid: boolean): void {
    if (valid && this.addCommandeError) {
      this.addCommandeError = null; // Clear error if child form is valid
    }
  }
}