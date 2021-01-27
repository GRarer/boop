import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

// include all of the material component modules that we use here to avoid cluttering the main AppModule
export const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatInputModule,
  MatIconModule,
  MatSnackBarModule,
  MatDatepickerModule,
  MatSelectModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
];

