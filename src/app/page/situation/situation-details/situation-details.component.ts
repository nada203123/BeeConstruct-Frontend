import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-situation-details',
  templateUrl: './situation-details.component.html',
  styleUrl: './situation-details.component.css'
})
export class SituationDetailsComponent {
  situation: any;

  constructor(
    public dialogRef: MatDialogRef<SituationDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.situation = data.situation;
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
