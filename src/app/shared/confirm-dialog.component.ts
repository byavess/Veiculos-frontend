import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn" style="vertical-align: middle; margin-right: 8px;">warning</mat-icon>
      {{ data.title || 'Confirmação' }}
    </h2>
    <mat-dialog-content>
      <p style="margin: 16px 0; line-height: 1.5;">{{ data.message || 'Tem certeza que deseja continuar?' }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" cdkFocusInitial>Cancelar</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        <mat-icon>delete</mat-icon>
        Deletar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 350px;
    }
    mat-dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }
  `]
})
export class ConfirmDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message?: string }
  ) {}

  ngOnInit(): void {
  }
}
