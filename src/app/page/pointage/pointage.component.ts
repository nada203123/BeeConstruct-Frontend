import { Component, OnInit } from '@angular/core';
import { PointageService, PointageResponseDto, CreatePointageDto } from '../../services/pointage/pointage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChantierService } from '../../services/chantier/chantier.service';
import { SituationService } from '../../services/situation/situation.service';

interface CalendarDay {
isInPeriod: any;
isSelectable: any;
  date: Date;
  dayNumber: number;
  dayLetter: string;
  isCurrentMonth: boolean;
  pointageData?: any;
}

interface WeekGroup {
  days: CalendarDay[];
}

@Component({
  selector: 'app-pointage',
  templateUrl: './pointage.component.html',
  styleUrls: ['./pointage.component.css']
})
export class PointageComponent implements OnInit {
  chantier: any;
  breadcrumb: string = '';
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  monthName = '';
  weekGroups: WeekGroup[] = [];

  workedHours: {[key: string]: number} = {};

  hasSelections: boolean = false;
  selectedPointageId: number | null = null;

   errorMessage: string = '';

   pendingHours: { [date: string]: number } = {};
  

  
  // Totals
  totalActiviteParHeure = 0;
  totalActiviteParJour = 0;
    situations: any[] = [];
  monthOptions: string[] = [];
  employees: any[] = [];
  selectedEmployee: string = '';
  selectedSituation: any = null;

  fillAllDaysChecked: boolean = false;

    role: string | null | undefined;
  
  // Day letters for French calendar
  dayLetters = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  
  constructor( private route: ActivatedRoute,private pointageService: PointageService,private router: Router,private chantierService: ChantierService,private situationService: SituationService) {}

  ngOnInit() {
    this.updateMonthName();
    this.generateCalendar();
    this.loadSituations();
    this.updateSelectionStatus();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadChantier(+id);
    }
    this.role = localStorage.getItem('user_role');
  }

  updateSelectionStatus(): void {
    this.hasSelections = !!this.selectedSituation && !!this.selectedEmployee;
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

  loadSituations() {
    const chantierId = this.route.snapshot.paramMap.get('id');
    if (chantierId) {
      this.situationService.getSituationByChantierId(+chantierId).subscribe({
        next: (data: any[]) => {
          this.situations = data;
          this.updateMonthOptions();
        },
        error: (err) => {
          console.error('Error loading situations:', err);
        }
      });
    }
  }

  updateMonthOptions() {
    this.monthOptions = [...new Set(this.situations.map(s => s.dateSituation))];
  }

  generateCalendarDays(startDate: string): WeekGroup[] {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 30); // Start date + 30 days

    // Find the first Monday before or on start date
    const firstDay = new Date(start);
    while (firstDay.getDay() !== 1) {
      firstDay.setDate(firstDay.getDate() - 1);
    }

    // Find the last Sunday after or on end date
    const lastDay = new Date(end);
    while (lastDay.getDay() !== 0) {
      lastDay.setDate(lastDay.getDate() + 1);
    }

    // Calculate total days and weeks
    const diffDays = Math.ceil((lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.ceil(diffDays / 7);

    // Generate days
    const days: CalendarDay[] = [];
    for (let i = 0; i < totalWeeks * 7; i++) {
      const currentDate = new Date(firstDay);
      currentDate.setDate(firstDay.getDate() + i);
      const isInRange = currentDate >= start && currentDate <= end;

      days.push({
        date: currentDate,
        dayNumber: currentDate.getDate(),
        dayLetter: this.dayLetters[currentDate.getDay()],
        isCurrentMonth: currentDate.getMonth() === start.getMonth(),
        isSelectable: isInRange,
        isInPeriod: isInRange
      });
    }

    // Group into weeks
    const weekGroups: WeekGroup[] = [];
    for (let i = 0; i < totalWeeks; i++) {
      const startIndex = i * 7;
      weekGroups.push({ days: days.slice(startIndex, startIndex + 7) });
    }

    return weekGroups;
  }

  getDayLetter(dayIndex: number): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[dayIndex];
  }

onMonthChange(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  const selectedDate = selectElement.value;

  this.selectedEmployee = '';
  this.selectedPointageId = null;
  this.fillAllDaysChecked = false; // Reset checkbox when month changes
  this.clearPointageData();

  if (!selectedDate) {
    this.selectedSituation = null;
    this.employees = [];
    this.weekGroups = [];
    this.updateSelectionStatus();
    return;
  }

  this.selectedSituation = this.situations.find(s => s.dateSituation === selectedDate);

  if (this.selectedSituation) {
    this.employees = this.selectedSituation.employes?.map((emp: any) => ({
      id: emp.id,
      prenom: emp.firstName || emp.prenomRepresentant || '',
      nom: emp.lastName || emp.nomRepresentant || '',
     
    })) || [];
    this.weekGroups = this.generateCalendarDays(this.selectedSituation.dateSituation);
  } else {
    this.employees = [];
    this.weekGroups = [];
  }

  this.updateSelectionStatus();
}

  onEmployeeChange(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  this.selectedEmployee = selectElement.value;
  this.fillAllDaysChecked = false; // Reset checkbox when employee changes
  this.updateSelectionStatus();

  if (!this.selectedSituation) {
    console.warn('Aucune situation sélectionnée');
    this.clearPointageData();
    return;
  }

  if (this.selectedEmployee && this.selectedSituation) {
    this.fetchPointageData(+this.selectedEmployee, this.selectedSituation.id);
  } else {
    this.clearPointageData();
  }
}

  private fetchPointageData(employeId: number, situationId: number): void {
    this.pointageService.getPointageBySituationAndEmploye(situationId, employeId).subscribe({
      next: (response: PointageResponseDto) => {
        this.selectedPointageId = response.id;
        this.updateCalendarWithPointageData(response);
      },
      error: (error) => {
        console.error('Error fetching pointage data:', error);
        if (error.status === 404) {
          this.initializeEmptyPointageData();
          this.selectedPointageId = null;
        }
      }
    });
  }

  private updateCalendarWithPointageData(pointageData: PointageResponseDto): void {
    this.clearPointageData();
    if (pointageData.heuresParJour) {
      this.workedHours = pointageData.heuresParJour;
    }

    this.weekGroups.forEach(week => {
      week.days.forEach(day => {
        if (day.isInPeriod) {
          const dateKey = this.formatDateToDDMMYYYY(day.date);
          if (this.workedHours[dateKey] !== undefined) {
            day.pointageData = { hours: this.workedHours[dateKey] };
          }
        }
      });
    });

    this.calculateTotalHours();
  }

  private initializeEmptyPointageData(): void {
    this.workedHours = {};
    this.weekGroups.forEach(week => {
      week.days.forEach(day => {
        if (day.isInPeriod) {
          const dateKey = this.formatDateToDDMMYYYY(day.date);
          this.workedHours[dateKey] = 0;
        }
      });
    });
    this.calculateTotalHours();
  }

  private clearPointageData(): void {
    this.workedHours = {};
    this.weekGroups.forEach(week => {
      week.days.forEach(day => {
        day.pointageData = null;
      });
    });
    this.totalActiviteParHeure = 0;
    this.totalActiviteParJour = 0;
  }

  private formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getCurrentMonthYear(): string {
    return this.monthOptions.length > 0 ? this.monthOptions[0] : '';
  }

  navigateToChantierDetails(): void {
    if (this.chantier?.id) {
      this.router.navigate(['accueil/chantiers', this.chantier.id]);
    }
  }

  navigateToChantierCards(): void {
    this.router.navigate(['accueil/chantiers']);
  }

  updateMonthName() {
    this.monthName = this.pointageService.getMonthName(this.currentMonth);
  }

  generateCalendar() {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay();

    const totalDays = 28;
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - (firstDayOfWeek - 1));

    this.weekGroups = [];

    for (let week = 0; week < 4; week++) {
      const weekDays: CalendarDay[] = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);
        const calendarDay: CalendarDay = {
          date: currentDate,
          dayNumber: currentDate.getDate(),
          dayLetter: this.dayLetters[day],
          isCurrentMonth: currentDate.getMonth() === this.currentMonth,
          isSelectable: false,
          isInPeriod: false,
          pointageData: null
        };
        weekDays.push(calendarDay);
      }
      this.weekGroups.push({ days: weekDays });
    }
  }

  onDayClick(day: CalendarDay) {
    if (!day.isInPeriod || !this.selectedEmployee) return;
    console.log('Day clicked:', day.date, 'Employee:', this.selectedEmployee);
  }

  isDaySelected(day: CalendarDay): boolean {
    return day.pointageData !== null && day.pointageData !== undefined;
  }

  getWorkedHours(day: CalendarDay): number {
    const dateKey = this.formatDateToDDMMYYYY(day.date);
    return this.workedHours[dateKey] || 0;
  }

  onHoursChange(day: CalendarDay, value: string) {
    const hours = parseFloat(value);
    const dateKeys = this.formatDateToDDMMYYYY(day.date);

    if (isNaN(hours) || !this.selectedPointageId || !day.isInPeriod) {
      return;
    }

     this.pendingHours[dateKeys] = hours;

    if (hours > 8) {
    // Show error message - you can customize this based on your notification system
    console.error('Le nombre d\'heures ne peut pas dépasser 8 heures par jour');
      this.errorMessage = 'Le nombre d\'heures ne peut pas dépasser 8 heures par jour.';
    

    
    // Revert to previous value
    day.pointageData = { hours: this.workedHours[dateKeys] || 0 };
    return;
  }

    
    this.pointageService.updateHeuresJour(this.selectedPointageId, dateKeys, hours).subscribe({
      next: (response: PointageResponseDto) => {

        this.workedHours[dateKeys] = hours;
        day.pointageData = { hours };
        this.calculateTotalHours();

        const anyInvalid = Object.values(this.pendingHours).some(h => h > 8);
      this.errorMessage = anyInvalid ? 'Le nombre d\'heures ne peut pas dépasser 8 heures par jour.' : '';

      },
      error: (error) => {
        console.error('Error updating hours:', error);
        // Optionally, revert the input value to the previous value
        day.pointageData = { hours: this.workedHours[dateKeys] || 0 };
      }
    });
  }

   clearErrorMessage(): void {
    this.errorMessage = '';
  }

  private calculateTotalHours(): void {
    this.totalActiviteParHeure = Object.values(this.workedHours).reduce(
      (sum, hours) => sum + hours,
      0
    );
    this.totalActiviteParJour = this.totalActiviteParHeure / 8;
  }

  onFillAllDaysChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.fillAllDaysChecked = checkbox.checked;
    console.log("fillAllDaysChecked",this.fillAllDaysChecked)
    console.log("this.selectedPointageId",this.selectedPointageId)

    if (!this.selectedPointageId) {
      console.error('No pointage ID selected');
      this.fillAllDaysChecked = false;
      return;
    }

    if (this.fillAllDaysChecked) {
      this.setAllHoursToEight();
    } else {
      this.setAllHoursToZero();
    }
  }

  // NEW METHOD: Call the service to set all hours to 8
  private setAllHoursToEight(): void {
    if (!this.selectedPointageId) {
      console.error('No pointage ID selected');
      return;
    }

    this.pointageService.setAllHeuresToEight(this.selectedPointageId).subscribe({
      next: (response: PointageResponseDto) => {
        console.log('Successfully set all hours to 8');
        this.updateCalendarWithPointageData(response);
      },
      error: (error) => {
        console.error('Error setting all hours to 8:', error);
        // Uncheck the checkbox if the operation failed
        this.fillAllDaysChecked = false;
      }
    });
  }

  private setAllHoursToZero(): void {
    if (!this.selectedPointageId) {
      console.error('No pointage ID selected');
      return;
    }

    this.pointageService.setAllHeuresToZero(this.selectedPointageId).subscribe({
      next: (response: PointageResponseDto) => {
        console.log('Successfully set all hours to 0');
        this.updateCalendarWithPointageData(response);
      },
      error: (error) => {
        console.error('Error setting all hours to 0:', error);
        // Check the checkbox back if the operation failed
        this.fillAllDaysChecked = true;
      }
    });
  }
}