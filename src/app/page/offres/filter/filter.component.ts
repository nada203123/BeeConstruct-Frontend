import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ClientInfo } from '../../../models/clientInfo.model';
import { OffreService } from '../../../services/offres/offre.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent implements OnInit {
  @Output() filterApplied = new EventEmitter<any>();

  @Input() set refreshTrigger(value: any) {
    if (value) {
      this.loadClients();
      this.loadLocalisations();
    }
  }
  
  clients: ClientInfo[] = [];
  localisations: string[] = [];
  
  selectedClientId: number | null = null;
  selectedLocalisation: string | null = null;
  selectedStatut: string | null = null;
  selectedType: string | null = null;
  
  showClientDropdown = false;
  showLocalisationDropdown = false;
  showStatutDropdown = false;
  showTypeDropdown = false;
  
  statusOptions = [
    { display: 'En attente de devis', value: 'EN_ATTENTE_DE_DEVIS' },
    { display: 'Refusée', value: 'REFUSEE' },
    { display: 'Acceptée', value: 'ACCEPTEE' }
  ];

  typeOptions = [
    { display: "Main d'oeuvre", value: "MAIN_D_OEUVRE" },
    { display: "Main d'oeuvre & Marchandises", value: "MAIN_D_OEUVRE_ET_MARCHANDISE" }
  ];
  
  constructor(private offreService: OffreService) { }
  
  ngOnInit(): void {
    this.loadClients();
    this.loadLocalisations();
  }
  
  getSelectedClientText(): string {
  if (this.selectedClientId && this.clients) {
    const selectedClient = this.clients.find(client => client.id === this.selectedClientId);
    return selectedClient ? selectedClient.nomSociete : 'Client';
  }
  return 'Client';
}

getSelectedLocalisationText(): string {
  return this.selectedLocalisation || 'Localisation';
}

getSelectedStatutText(): string {
  if (this.selectedStatut && this.statusOptions) {
    const selectedStatutOption = this.statusOptions.find(option => option.value === this.selectedStatut);
    return selectedStatutOption ? selectedStatutOption.display : 'Statut';
  }
  return 'Statut';
}

getSelectedTypeText(): string {
  if (this.selectedType && this.typeOptions) {
    const selectedTypeOption = this.typeOptions.find(option => option.value === this.selectedType);
    return selectedTypeOption ? selectedTypeOption.display : 'Type';
  }
  return 'Type';
}

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Check if click was outside all dropdown containers
    if (!target.closest('.filter-dropdown')) {
      this.showClientDropdown = false;
      this.showLocalisationDropdown = false;
      this.showStatutDropdown = false;
      this.showTypeDropdown = false;
    }
  }

  
  loadClients(): void {
    this.offreService.getAllDistinctClients().subscribe(
      (data) => {
        this.clients = data;
      },
      (error) => {
        console.error('Error loading clients:', error);
      }
    );
  }
  
  loadLocalisations(): void {
    this.offreService.getAllLocalisations().subscribe(
      (data) => {
        this.localisations = data;
      },
      (error) => {
        console.error('Error loading localisations:', error);
      }
    );
  }
  
  toggleClientDropdown(): void {
    this.showClientDropdown = !this.showClientDropdown;
    this.showLocalisationDropdown = false;
    this.showStatutDropdown = false;
    this.showTypeDropdown = false;
  }
  
  toggleLocalisationDropdown(): void {
    this.showLocalisationDropdown = !this.showLocalisationDropdown;
    this.showClientDropdown = false;
    this.showStatutDropdown = false;
    this.showTypeDropdown = false;
  }
  
  toggleStatutDropdown(): void {
    this.showStatutDropdown = !this.showStatutDropdown;
    this.showClientDropdown = false;
    this.showLocalisationDropdown = false;
    this.showTypeDropdown = false;
  }

  toggleTypeDropdown(): void {
    this.showTypeDropdown = !this.showTypeDropdown;
    this.showStatutDropdown = false;
    this.showClientDropdown = false;
    this.showLocalisationDropdown = false;
  }
  
  selectClient(client: ClientInfo): void {
    this.selectedClientId = client.id;
    this.showClientDropdown = false;
  }
  
  selectLocalisation(localisation: string): void {
    this.selectedLocalisation = localisation;
    this.showLocalisationDropdown = false;
  }
  
  selectStatut(statut: { display: string, value: string }): void {
    this.selectedStatut = statut.value;
    this.showStatutDropdown = false;
  }

  selectType(type: { display: string, value: string }): void {
    this.selectedType = type.value;
    this.showTypeDropdown = false;
  }
  
  applyFilters(): void {
    const filters = {
      clientId: this.selectedClientId,
      localisation: this.selectedLocalisation,
      statut: this.selectedStatut,
      type: this.selectedType
    };
    
    this.filterApplied.emit(filters);
  }
  
  resetFilters(): void {
    this.selectedClientId = null;
    this.selectedLocalisation = null;
    this.selectedStatut = null;
    this.selectedType = null;
    this.filterApplied.emit(null);
  }

}
