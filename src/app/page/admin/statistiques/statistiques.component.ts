import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { ChantierService } from '../../../services/chantier/chantier.service';
import { OffreService } from '../../../services/offres/offre.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { SituationService } from '../../../services/situation/situation.service';
import { EmployeService } from '../../../services/employes/employe.service';

@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.component.html',
  styleUrl: './statistiques.component.css'
})
export class StatistiquesComponent implements OnInit {
  partBeeHive = 0;
  chantiers = 0;
  clients = 0;
  employes = 0;

   prospectionData: { status: string, value: number }[] = [];

  

 chargesData: { category: string, value: number }[] = [];

  constructor(private clientService: ClientService, private chantierService: ChantierService, private offreService: OffreService,private situationService: SituationService , private employeService: EmployeService) { }

  ngOnInit(): void {
        this.loadClientsCount();
         this.loadChantiersCount();
          this.loadProspectionData();
          this.loadChargesData();
          this.loadEmployesCount();
          
  }


  

    private loadChargesData(): void {
    this.situationService.getAllSituations().subscribe({
      next: (situations: any[]) => {
        // Créer un objet pour accumuler les charges par chantier
        const chargesParChantier: { [key: number]: { titre: string, totalCharge: number } } = {};

        // Parcourir toutes les situations
        situations.forEach(situation => {
          const chantierId = situation.chantier.id;
          const charge = situation.chargeSituation || 0;

          if (chargesParChantier[chantierId]) {
            // Si le chantier existe déjà, ajouter la charge
            chargesParChantier[chantierId].totalCharge += charge;
          } else {
            // Sinon, créer une nouvelle entrée
            chargesParChantier[chantierId] = {
              titre: situation.chantier.titre,
              totalCharge: charge
            };
          }
        });

        // Convertir l'objet en tableau pour chargesData
        this.chargesData = Object.values(chargesParChantier).map(chantier => ({
          category: chantier.titre,
          value: chantier.totalCharge
        }));

        
      },
      error: (error: any) => {
        console.error('Error loading situations:', error);
        // Valeurs par défaut en cas d'erreur
        this.chargesData = [
        
        ];
      }
    });
  }

  get hasChargesData(): boolean {
  return this.chargesData?.length > 0;
  }



   
  private loadClientsCount(): void {
    this.clientService.getAllActiveClients().subscribe({
      next: (clients: any[]) => {
        this.clients = clients.length;
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
        // Keep default value of 0 on error
      }
    });
  }
  
  private loadEmployesCount(): void {
    this.employeService.getActivePerDiemAndPropBeehiveEmployes().subscribe({
      next: (employes: any[]) => {
        this.employes = employes.length;
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
        
      }
    });
  }

  private loadProspectionData(): void {
    forkJoin({
      refused: this.offreService.getActiveOffresByStatut('REFUSEE'),
      waiting: this.offreService.getActiveOffresByStatut('EN_ATTENTE_DE_DEVIS'),
      accepted: this.offreService.getActiveOffresByStatut('ACCEPTEE')
    }).pipe(
      map(results => {
        return [
          { status: 'Refusé', value: results.refused.length || 0 },
          { status: 'En attente de devis', value: results.waiting.length || 0 },
          { status: 'Accepté', value: results.accepted.length || 0 }
        ];
      })
    ).subscribe({
      next: (data) => {
        this.prospectionData = data;
        console.log(this.prospectionData)
      },
      error: (error) => {
        console.error('Error loading prospection data:', error);
        // Fallback to empty array or default values if needed
        this.prospectionData = [
          { status: 'Refusé', value: 0 },
          { status: 'En attente devis', value: 0 },
          { status: 'Accepté', value: 0 }
        ];
      }
    });
  }

  get hasProspectionData(): boolean {

  return this.prospectionData?.some(item => item.value > 0) ?? false;
  }

  

   private loadChantiersCount(): void {
    this.chantierService.getAllChantiers().subscribe({
      next: (chantiers: any[]) => {
        this.chantiers = chantiers.length;
        const totalCumul = chantiers.reduce((sum, chantier) => sum + (chantier.cumulPartBeehive || 0), 0);
      this.partBeeHive = totalCumul;
        console.log(`Loaded ${this.chantiers} chantiers`);
        console.log(`Total cumulPartBeehive: ${this.partBeeHive}`);
      },
      error: (error: any) => {
        console.error('Error loading chantiers:', error);
        
      }
    });
  }


  // Method to get max value for chart scaling
  getMaxChargesValue(): number {
    if (this.chargesData.length === 0) return 40000;
    const maxValue = Math.max(...this.chargesData.map(item => item.value));
    // Arrondir vers le haut au millier le plus proche pour un affichage propre
    return Math.ceil(maxValue / 10000) * 10000;
  }

  // Method to calculate percentage for bar height
  getBarHeight(value: number): number {
    const maxValue = this.getMaxChargesValue();
    return (value / maxValue) * 100;
  }

   getYAxisLabels(): string[] {
    const maxValue = this.getMaxChargesValue();
    const labels: string[] = [];
    const stepCount = 4; // Nombre d'étapes sur l'axe Y
    
    for (let i = stepCount; i >= 0; i--) {
      const value = (maxValue / stepCount) * i;
      if (value >= 1000) {
        labels.push(`${value / 1000}K`);
      } else {
        labels.push(`${value}`);
      }
    }
    
    return labels;
  }

  getPolylinePoints(): string {
  if (!this.chargesData || this.chargesData.length === 0) return '';

  const chartWidth = 495; // percent
  const chartHeight = 160; // match .chart-line height in px
  const maxValue = this.getMaxChargesValue();

  return this.chargesData
    .map((item, i) => {
      const x = (i / (this.chargesData.length - 1)) * chartWidth;
      const y = chartHeight - (item.value / maxValue) * chartHeight;
      return `${(x).toFixed(2)},${(y).toFixed(2)}`;
    })
    .join(' ');
}

  // In your component.ts
tooltip = {
  visible: false,
  x: 0,
  y: 0,
  value: 0
};



}
