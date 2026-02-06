import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeService } from '../../../services/employes/employe.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SituationService } from '../../../services/situation/situation.service';

@Component({
  selector: 'app-modify-situation',
  templateUrl: './modify-situation.component.html',
  styleUrls: ['./modify-situation.component.css']
})
export class ModifySituationComponent implements OnInit {
  situationForm: FormGroup;
  employees: any[] = [];
  selectedEmployees: any[] = [];
  portionBeehiveOptions = [ 15, 20, 25, 30];
  dropdownOpen = false;
  dropdownEOpen = false;
  errorMessage: string = '';

  @Output() situationModified = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeService,
     private situationService: SituationService,
    private dialogRef: MatDialogRef<ModifySituationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      chantierId: number,
      situation: any 
    }
  ) {
    this.situationForm = this.fb.group({
      id:[],
      nomSituation: ['', Validators.required],
      dateSituation: ['', Validators.required],
      montantGlobal: ['', Validators.required],
      montantCharge: ['', Validators.required],
      portionBeehive: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.populateForm();
  }

  populateForm(): void {
    console.log("populate modify",this.data.situation)
    if (this.data.situation) {
      this.situationForm.patchValue({
        id: this.data.situation.id,
        nomSituation: this.data.situation.nomSituation,
        dateSituation: this.formatDate(this.data.situation.dateSituation),
        montantGlobal: this.data.situation.montantGlobal,
        montantCharge: this.data.situation.chargeSituation,
        portionBeehive: this.data.situation.portionBeehivePourcentage
      });

      // Set selected employees if they exist in the situation
      if (this.data.situation.employes) {
        console.log("employe exist")
        this.selectedEmployees = [...this.data.situation.employes];
      }
    }
  }

  private formatDate(date: string): string {
    // Format the date to YYYY-MM-DD for the date input
    return date ? new Date(date).toISOString().split('T')[0] : '';
  }

  loadEmployees(): void {
    this.employeeService.getAllActiveEmployes().subscribe({
      next: (data) => {
        this.employees = data;
          console.log("employees from modify",data)
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

  selectPortionBeehive(option: number): void {
    this.situationForm.get('portionBeehive')?.setValue(option);
    this.dropdownOpen = false;
  }

  isSelected(employee: any): boolean {
    return this.selectedEmployees.some(emp => emp.id === employee.id);
  }

  selectEmployee(employee: any): void {
    const index = this.selectedEmployees.findIndex(emp => emp.id === employee.id);
    if (index === -1) {
      this.selectedEmployees.push(employee);
    } else {
      this.selectedEmployees.splice(index, 1);
    }
  }

  removeEmployee(employee: any): void {
    this.selectedEmployees = this.selectedEmployees.filter(emp => emp.id !== employee.id);
  }

  onSubmit(): void {
    console.log("this.selectedEmployees.length " , this.selectedEmployees.length )
    console.log("this.situationForm.valid",this.situationForm.valid)
    if (this.situationForm.valid ) {
      const formValue = this.situationForm.value;
      console.log("formvalue",formValue)
       const requestPayload = {
      id: this.data.situation.id, // Ensure ID is included
      nomSituation: formValue.nomSituation,
      dateSituation: formValue.dateSituation,
      montantGlobal: formValue.montantGlobal,
      chargeSituation: formValue.montantCharge, // Map to backend field name
      portionBeehivePourcentage: formValue.portionBeehive, // Map to backend field name
      employeIds: this.selectedEmployees.map(emp => emp.id), // Send only IDs
      chantierId: this.data.chantierId // Include if required by backend
    };
      console.log("modifiedSituation",requestPayload)
      console.log("this.data.situation.id",this.data.situation.id)

       this.situationService.updateSituation(this.data.situation.id,requestPayload).subscribe({
        next: (response) => {
          console.log('Situation updated successfully:', response);
         this.situationModified.emit(requestPayload);
        this.dialogRef.close(requestPayload);
          
        },
        error: (error) => {
          console.error('Error creating situation:', error);
          console.error('Error:', error);
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          }
         
        }
      });
   

     
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires ';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}