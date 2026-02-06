import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChantierService } from '../../../services/chantier/chantier.service';
import { SituationService } from '../../../services/situation/situation.service';
import { MatDialog } from '@angular/material/dialog';
import { AddSituationComponent } from '../add-situation/add-situation.component';
import { SituationDetailsComponent } from '../situation-details/situation-details.component';
import { Color } from '@swimlane/ngx-charts';
import { ModifySituationComponent } from '../modify-situation/modify-situation.component';

@Component({
  selector: 'app-situation',
  templateUrl: './situation.component.html',
  styleUrl: './situation.component.css'
})
export class SituationComponent implements OnInit {
  chantier: any;
  breadcrumb: string = '';

  situations: any[] = [];

  situationsData: any[] = [];
  selectedSituation: number | null = null;
  selectedSituationId: number | null = null;
  showDeleteConfirmModal: boolean = false;
  isSuccess: boolean = false;
   isSuccessModified: boolean = false;
  isSuccessDelete: boolean = false;

  chartData: any[] = [];
  totalMontant: number = 0;
   totalCharges: number = 0;
 

   constructor(
      private route: ActivatedRoute,
      private chantierService: ChantierService, private router: Router, private situationService: SituationService,private dialog: MatDialog
    ) { }

    // Dans votre SituationComponent :

    colorScheme = 'natural';

    tooltipFormatting = (value: any) => {
      return `${value.data.name}: ${value.value} € (${value.data.extra?.percentage || '0'}%)`;
    };

   

    labelFormatting(name: string): string {
  return name.length > 22 ? name.slice(0, 20) + '…' : name;
}
  
    ngOnInit(): void {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        console.log(id)
        this.loadChantier(+id);
        this.loadSituations(+id);
      }
    }
  
    loadChantier(id: number): void {
      this.chantierService.getChantierById(id).subscribe({
        next: (data) => {
          this.chantier = data;
          this.breadcrumb = `Chantiers > ${this.chantier.titre} > Données d'avancement`;
        },
        error: (err) => console.error('Error fetching chantier:', err)
      });
    }

    loadSituations(chantierId: number): void {
      this.situationService.getSituationByChantierId(chantierId).subscribe({
        next: (data: any[]) => {
          this.situations = data;
          this.situationsData = data;
          this.totalCharges = this.calculateTotalCharges(data);
          this.prepareChartData();
          
      console.log(this.situationsData)
          
 
        },
        error: (err) => console.error('Error fetching situations:', err)
      });
    }


    calculateTotalCharges(situations: any[]): number {
  return situations.reduce((sum, situation) => sum + (situation.chargeSituation || 0), 0);
  }

    prepareChartData(): void {
      //this.totalMontant = this.situations.reduce((sum, situation) => sum + situation.montantGlobal, 0);
      this.totalMontant = this.chantier.coutTotal;
      const totalSituations = this.situations.reduce((sum, situation) => sum + situation.montantGlobal, 0);
      const remainingAmount = this.totalMontant - totalSituations;
      // Préparation des données pour le graphique
      const situationData = this.situations.map((situation, index) => {
        const percentage = (situation.montantGlobal / this.totalMontant) * 100;
        return {
          name: situation.nomSituation,
          value: situation.montantGlobal,
          extra: {  // Add percentage in the 'extra' property
            percentage: percentage.toFixed(2)
          },
          color: this.getColorForIndex(index)
        };
      });

      if (remainingAmount > 0) {
        const remainingPercentage = (remainingAmount / this.totalMontant) * 100;
        situationData.push({
          name: 'Restant',
          value: remainingAmount,
          extra: {
            percentage: remainingPercentage.toFixed(2)
          },
          color: '#CCCCCC' // Grey color
        });
      }
    
      // Sort by value descending (optional)
      this.chartData = situationData.sort((a, b) => b.value - a.value);
    }

  

    getColorForIndex(index: number): string {
      const colors = ['#FF8A65', '#FF5722', '#E64A19', '#BF360C', '#D84315', '#FF7043'];
      return colors[index % colors.length];
    }

   

    getEmployeeNames(situation: any): string {
      if (!situation.employes || situation.employes.length === 0) {
        return '-';
      }
      
      return situation.employes.map((emp: { type: string; soustraitant: any; firstName: any; lastName: any; }) => {
        if (emp.type === 'SOUSTRAITANT') {
          return emp.soustraitant;
        } else {
          return [emp.firstName, emp.lastName].filter(Boolean).join(' ');
        }
      }).filter(Boolean).join(', ');
    }

    openAddSituationDialog(): void {
      const dialogRef = this.dialog.open(AddSituationComponent, {
        width: '800px',
        data: { chantierId: this.chantier.id }
      });

      dialogRef.componentInstance.situationAdded.subscribe(() => {
  this.loadSituations(this.chantier.id);
   
          this.loadChantier(this.chantier.id);
});

  
      /*dialogRef.componentInstance.situationAdded.subscribe((newSituation: any) => {
        this.situationsData = [...this.situationsData, newSituation];
        this.situations = [...this.situations, newSituation];
      });*/
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.isSuccess = true;
          
          
          
          setTimeout(() => {
            this.isSuccess = false;
           
          }, 1800);
        }
      });
    }

    deleteSituation(situationId: number): void {
    
        this.situationService.deleteSituation(situationId).subscribe({
          next: () => {
            // Remove the deleted situation from the arrays
           /* this.situationsData = this.situationsData.filter(s => s.id !== situationId);
            this.situations = this.situations.filter(s => s.id !== situationId);*/
          this.loadSituations(this.chantier.id);
          this.loadChantier(this.chantier.id);

            this.isSuccessDelete = true;
        setTimeout(() => {
          this.isSuccessDelete = false;
        
          
        }, 1800);
      
            // Optional: Show a success message
            console.log('Situation deleted successfully');
          },
          error: (err) => {
            console.error('Error deleting situation:', err);
            // Optional: Show an error message
          }
        });
      
    }

    navigateToChantierDetails(): void {
      if (this.chantier?.id) {
        this.router.navigate(['accueil/chantiers', this.chantier.id]);
      }
    }

    navigateToChantierCards(): void {
    
      this.router.navigate(['accueil/chantiers']);
    
  }

  openDeleteConfirmModal(itemId: number): void {
    this.selectedSituationId = itemId;
    this.showDeleteConfirmModal = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmModal = false;
    this.selectedSituationId = null;
  }

  confirmDelete(): void {
    if (this.selectedSituationId !== null) {
      this.deleteSituation(this.selectedSituationId);
      this.showDeleteConfirmModal = false;
      this.selectedSituationId = null;
    
     
    }
  }

  openSituationDetails(situation: any): void {
    this.dialog.open(SituationDetailsComponent, {
      width: '600px',
      data: { situation }
    });
  }
  

   openModifySituationDialog(situation: any): void {
      const dialogRef = this.dialog.open(ModifySituationComponent, {
        width: '800px',
        data: { chantierId: this.chantier.id,
          situation: situation
         }
      });
        console.log("situation",this.situations)
      console.log(" modify dialog open successfully")
  
      dialogRef.componentInstance.situationModified.subscribe(() => {
           this.loadSituations(this.chantier.id);
          this.loadChantier(this.chantier.id);
        console.log(this.situations)
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this. isSuccessModified = true;
          
          
          
          setTimeout(() => {
            this. isSuccessModified = false;
            
          }, 1800);
        }
      });
    }

     
  

  

    

}
