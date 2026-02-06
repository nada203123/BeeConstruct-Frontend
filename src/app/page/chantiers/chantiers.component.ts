import { Component, HostListener, OnInit } from '@angular/core';
import { ChantierService } from '../../services/chantier/chantier.service';
import { Router } from '@angular/router';

export interface Chantier {
  id: number;  
  titre: string;
  localisation: string;
  client: string;
  coutTotal: number;
  dateDeDebut: string;
  cumulPartBeehive: number;
  progression: number;
  statut: 'termine' | 'en_cours' | 'en_pause'; 
  isDropdownOpen?: boolean;
}

@Component({
  selector: 'app-chantiers',
  templateUrl: './chantiers.component.html',
  styleUrls: ['./chantiers.component.scss']
})
export class ChantiersComponent implements OnInit {
  chantiers: Chantier[] = [];
  displayedChantiers: Chantier[] = [];
  currentPage = 1;
  totalPages = 1;
  pageSize = 3;
  errorMessage = '';
  showModifyModal: boolean = false;
  selectedChantierId: number | null = null;
  isSuccessModified: boolean = false;

    role: string | null | undefined;

  constructor(private chantierService: ChantierService, private router: Router) { }

  ngOnInit(): void {
    this.loadChantiers();
    this.role = localStorage.getItem('user_role');
  }

  toggleDropdown(chantier: Chantier): void {
    chantier.isDropdownOpen = !chantier.isDropdownOpen;
  }

 

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedChantiers();
    }
  }

  loadChantiers(): void {
    this.chantierService.getAllChantiers().subscribe({
      next: (data) => {
        this.chantiers = data.map((chantier: any) => ({
          id: chantier.id,
          titre: chantier.titre || '-',
          localisation: chantier.localisation || '-',
          client: chantier.client || '-',
          coutTotal: chantier.coutTotal || 0,
          cumulPartBeehive: chantier.cumulPartBeehive || 0,
          dateDeDebut: chantier.dateDeDebut || '-',
          progression: chantier.progression ? `${chantier.progression}%` : '0%',
          statut: this.mapStatut(chantier.statut),
          isDropdownOpen: false
        }));

        this.totalPages = Math.ceil(this.chantiers.length / this.pageSize);
        
        // Update displayed chantiers
        this.updateDisplayedChantiers();
      },
      error: (err) => {
        console.error('Error fetching chantiers:', err);
      }
    });
  }
  updateDisplayedChantiers(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.chantiers.length);
    this.displayedChantiers = this.chantiers.slice(startIndex, endIndex);
  }

  private mapStatut(statut: any): 'termine' | 'en_cours' | 'en_pause' {
    if (statut === 'termine' || statut === 'en_cours' || statut === 'en_pause') {
      return statut;
    }
    return 'en_cours';
  }

  onChantierUpdated(): void {
    this.isSuccessModified = true;
    this.loadChantiers(); 
    this.closeModifyChantierModal();
    setTimeout(() => {
      this.isSuccessModified = false;
    }, 1900);
  }

  closeModifyChantierModal(): void {
    this.showModifyModal = false;
    this.selectedChantierId = null;
  }

  

  navigateToChantierDetail(chantier: Chantier): void {
    if (chantier.id) {
      this.router.navigate(['accueil/chantiers', chantier.id]);
    }
  }

  openModifyModal(chantierId: number): void {
    this.selectedChantierId = chantierId;
    this.showModifyModal = true;
  }

  closeModifyModal(): void {
    this.showModifyModal = false;
    this.selectedChantierId = null;
    this.loadChantiers();
    setTimeout(() => {
      this.isSuccessModified = false;
    }, 1800);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.status-dropdown')) {
      this.displayedChantiers.forEach(chantier => {
        if (chantier.isDropdownOpen) {
          chantier.isDropdownOpen = false;
        }
      });
    }
  }

  changeStatus(chantierId: number, newStatus: 'termine' | 'en_cours' | 'en_pause'): void {
    this.chantierService.updateChantierStatus(chantierId, newStatus).subscribe({
      next: () => {
        // Update the local chantier data
        const chantier = this.chantiers.find(c => c.id === chantierId);
        if (chantier) {
          chantier.statut = newStatus;
          this.updateDisplayedChantiers();
        }
        // Close the dropdown
        const chantierWithDropdown = this.displayedChantiers.find(c => c.id === chantierId);
        if (chantierWithDropdown) {
          chantierWithDropdown.isDropdownOpen = false;
        }
      },
      error: (err) => {
        console.error('Error updating chantier status:', err);
      }
    });
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'termine': return 'Terminé';
      case 'en_cours': return 'En cours';
      case 'en_pause': return 'En pause';
      default: return status;
    }
  }
  
}