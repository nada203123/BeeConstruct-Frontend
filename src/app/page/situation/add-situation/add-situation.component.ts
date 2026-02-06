import { Component, EventEmitter, HostListener, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SituationService } from '../../../services/situation/situation.service';
import { EmployeService } from '../../../services/employes/employe.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CreatePointageDto, PointageService } from '../../../services/pointage/pointage.service';

@Component({
  selector: 'app-add-situation',
  templateUrl: './add-situation.component.html',
  styleUrl: './add-situation.component.css'
})
export class AddSituationComponent implements OnInit {

  situationForm: FormGroup;
  chantierId: number;
  employees: any[] = [];
  selectedEmployees: any[] = [];
  portionBeehiveOptions = [15, 20, 25, 30];
  dropdownOpen = false;
  dropdownEOpen = false;
  errorMessage: string = '';

  @Output() situationAdded = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private pointageService: PointageService,
    private situationService: SituationService,
    private employeeService: EmployeService,
    private dialogRef: MatDialogRef<AddSituationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { chantierId: number }
  ) {
    this.chantierId = data.chantierId;
    this.situationForm = this.fb.group({
      nomSituation: ['', Validators.required],
      dateSituation: ['', Validators.required],
      montantGlobal: [null, [Validators.required, Validators.min(0)]],
      montantCharge: [null, [Validators.required, Validators.min(0)]],
      portionBeehive: [null], 
      employeIds: [[]]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getAllActiveEmployes().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => console.error('Error fetching employees:', err)
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleEDropdown(): void {
    this.dropdownEOpen = !this.dropdownEOpen;
  }


  selectEmployee(employee: any): void {
    const index = this.selectedEmployees.findIndex(e => 
      (e.id === employee.id && e.type === employee.type));
    
    if (index === -1) {
      this.selectedEmployees.push(employee);
    } else {
      this.selectedEmployees.splice(index, 1);
    }
    
    this.situationForm.patchValue({
      employeIds: this.selectedEmployees.map(e => ({ id: e.id, type: e.type }))
    });
  }

  @HostListener('document:click', ['$event'])
onClickOutside(event: Event) {
  if (!(event.target as HTMLElement).closest('.employees-selector')) {
    this.dropdownEOpen = false;
  }
}

  isSelected(employee: any): boolean {
    return this.selectedEmployees.some(e => 
      (e.id === employee.id && e.type === employee.type));
  }

  removeEmployee(employee: any): void {
    const index = this.selectedEmployees.findIndex(e => 
      (e.id === employee.id && e.type === employee.type));
    
    if (index !== -1) {
      this.selectedEmployees.splice(index, 1);
      this.situationForm.patchValue({
        employeIds: this.selectedEmployees.map(e => ({ id: e.id, type: e.type }))
      });
    }
  }

  selectPortionBeehive(value: number): void {
    this.situationForm.patchValue({
      portionBeehive: value
    });
    this.dropdownOpen = false;
  }

  calculatePortionBeehiveMontant(): number {
    const montantGlobal = this.situationForm.get('montantGlobal')?.value || 0;
    const portionBeehive = this.situationForm.get('portionBeehive')?.value || 0;
    return (montantGlobal * portionBeehive) / 100;
  }

  calculateChargeSituation(): number {
    const montantGlobal = this.situationForm.get('montantGlobal')?.value || 0;
    const montantNet = this.situationForm.get('montantNet')?.value || 0;
    return montantGlobal - montantNet;
  }

  onSubmit(): void {
    
      const formData = this.situationForm.value;
      
      const situationRequest = {
        nomSituation: formData.nomSituation,
        dateSituation: formData.dateSituation,
        chantierId: this.chantierId,
        montantGlobal: formData.montantGlobal,
        chargeSituation: formData.montantCharge, 
        portionBeehivePourcentage: formData.portionBeehive , 
        employeIds: this.selectedEmployees.map(e => e.id) 
      };
console.log(this.situationForm.get('nomSituation')?.value)
      if (!this.situationForm.get('nomSituation')?.value || 
        !this.situationForm.get('dateSituation')?.value || 
        !this.situationForm.get('montantGlobal')?.value ||
        !this.situationForm.get('montantCharge')?.value ||
        !this.situationForm.get('portionBeehive')?.value ) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

      this.situationService.createSituation(situationRequest).subscribe({
        next: (response) => {
          console.log('Situation created successfully:', response);
           this.createPointageForEmployees(response, formData.dateSituation);
          this.situationAdded.emit(response); // Emit event to parent component
          this.dialogRef.close(response); // Close dialog and return the response
          
        },
        error: (error) => {
          console.error('Error creating situation:', error);
          console.error('Error:', error);
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          }
          // Handle error - you might want to show an error message to the user
        }
      });
   
    
  }

  onCancel(): void {
    this.dialogRef.close();
  }


 private createPointageForEmployees(situation: any, dateSituation: string): void {
  const dateRange = this.generateDateRange(dateSituation);
  
  this.selectedEmployees.forEach(employee => {
    // Initialize heuresParJour with 0 for each date
    const heuresParJour: { [key: string]: number } = {};
    dateRange.forEach(date => {
      heuresParJour[date] = 0; // Set default hours to 0 for each date
    });

    const pointageData: CreatePointageDto = {
      employeId: employee.id,
      situationId: situation.id,
      heuresParJour: heuresParJour // Include the hours map
    };
    
    this.pointageService.createPointage(pointageData).subscribe({
      next: (pointageResponse) => {
        console.log('Pointage created for employee', employee.id, 'with dates:', dateRange);
      },
      error: (error) => {
        console.error('Error creating pointage for employee', employee.id, ':', error);
      }
    });
  });
}

private generateDateRange(startDateString: string): string[] {
  const startDate = new Date(startDateString);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1); // Add 1 month
  
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    
    dates.push(`${day}-${month}-${year}`); // Format as DD-MM-YYYY to match backend validation
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

}
