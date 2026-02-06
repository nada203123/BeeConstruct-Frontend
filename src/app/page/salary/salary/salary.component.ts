import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SalaryService } from '../../../services/salary/salary.service';
import { SituationService } from '../../../services/situation/situation.service';
import { ChantierService } from '../../../services/chantier/chantier.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Employe } from '../../../models/employe.model';
import { PointageService } from '../../../services/pointage/pointage.service';



interface Situation {
  id: number;
  nomSituation: string;
  dateSituation: string;
  montantSalaire: number;
  employes: Employe[];
}

interface Chantier {
  id: number;
  titre: string;
}



@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {
  situationId: number | null = null;
  chantierTitre: string = '';
  situations: Situation[] = [];
  selectedSituationId: number | null = null;
 
  currentPage: number = 1;
  itemsPerPage: number = 5;
 
  montantSalaire: number = 0;
  nombreJoursHomme: number = 0;
  salaireParJour: number = 0;

  salaries: any[] = [];

  showAddRetenueModal: boolean = false;
retenueEmployeeId: number | null = null;

retenueType: string = 'avance';
retenueAmount: number | null = null;

showSuccessModal: boolean = false;
successMessage: string = '';


 
 
 

  constructor(
    private route: ActivatedRoute,
    private salaryService: SalaryService,
    private situationService: SituationService,
    private chantierService: ChantierService,
     private pointageService: PointageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.situationId = +id;
      this.loadChantierDetails();
      this.loadSituations();
    }
  }

  loadChantierDetails(): void {
    if (this.situationId) {
      this.chantierService.getChantierById(this.situationId).subscribe({
        next: (data: Chantier) => {
          this.chantierTitre = data.titre || 'Chantier inconnu';
        },
        error: (err) => {
          console.error('Erreur lors du chargement des détails du chantier:', err);
          this.chantierTitre = 'Erreur de chargement du chantier';
        }
      });
    }
  }

  loadSituations(): void {
    if (this.situationId) {
      console.log('Chargement des situations pour chantierId:', this.situationId);
      this.situationService.getSituationByChantierId(this.situationId).subscribe({
        next: (situations: Situation[]) => {
          this.situations = situations;
          console.log('Situations chargées:', situations);
          console.log('IDs des situations (avec types):', situations.map((s: Situation) => ({ id: s.id, type: typeof s.id })));
          // Reset to empty state, no auto-selection
          this.selectedSituationId = null;
        
          
          this.nombreJoursHomme = 0;
          this.salaireParJour = 0;
          this.montantSalaire = 0;
         
        
        },
        error: (err) => {
          console.error('Échec du chargement des situations:', err);
          this.situations = [];
        }
      });
    }
  }

 onSituationChange(): void {
  const situationId = this.selectedSituationId !== null ? +this.selectedSituationId : null;
  if (situationId !== null) {
    const selectedSituation = this.situations.find(s => Number(s.id) === situationId);
    if (selectedSituation) {
      this.montantSalaire = selectedSituation.montantSalaire;

      this.pointageService.getTotalNombreJoursTravaillesBySituationId(situationId).subscribe(totalDays => {
        this.nombreJoursHomme = totalDays;
        this.salaireParJour = this.nombreJoursHomme > 0 ? this.montantSalaire / this.nombreJoursHomme : 0;
      });

      this.salaryService.getSalariesBySituationId(situationId).subscribe({
        next: (data: any[]) => {
          console.log("salary",data)
          this.salaries = data.map(salary => {
            const employe = selectedSituation.employes.find(e => e.id === salary.employeeId);
            const avance = salary.avance|| 0;
      const cotisation = salary.cotisation|| 0;
      const loyer = salary.loyer || 0;
      const salaireNet = salary.montantSalaire - (avance + cotisation + loyer);
            return {
              ...salary,
              employeeName: employe ? employe.firstName + ' ' + employe.lastName : 'Inconnu',
              salaireNet: salaireNet
            };
          });
        },
        error: () => { this.salaries = []; }
      });

    
    }
  }
}

openAddRetenueModal(employeeId: number): void {
  this.retenueEmployeeId = employeeId;
  this.showAddRetenueModal = true;
}

// Méthode pour fermer le modal
closeAddRetenueModal(): void {
  this.showAddRetenueModal = false;
  this.retenueEmployeeId = null;
}



saveRetenue(): void {

  if (this.selectedSituationId !== null && this.retenueEmployeeId !== null && this.retenueType && this.retenueAmount !== null) {
    console.log("this.situationId",this.selectedSituationId)
    this.salaryService.addRetenue(this.selectedSituationId, this.retenueEmployeeId, this.retenueType, this.retenueAmount)
      .subscribe({
        next: (updatedSalary) => {
          console.log("updatedSalary",updatedSalary)
          
          this.closeAddRetenueModal();

       
          this.onSituationChange();

           this.successMessage = 'Retenue ajoutée avec succès.';
        this.showSuccessModal = true;

        
          console.log('Retenue ajoutée avec succès.', updatedSalary);

           setTimeout(() => {
          this.showSuccessModal = false;
          this.successMessage = '';
        }, 3000);
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de la retenue', error);
        }
      });
  } else {
    console.warn('Formulaire de retenue incomplet');
  }
}



get paginatedSalaries(): any[] {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  return this.salaries.slice(startIndex, startIndex + this.itemsPerPage);
}

get totalPages(): number {
  return Math.ceil(this.salaries.length / this.itemsPerPage);
}

goToPage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}


  
}