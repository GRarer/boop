import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BoopError } from 'boop-core';
import { map } from 'rxjs/operators';
import { ConfirmationDialogOptions, DialogComponent } from './dialog.component';

@Injectable()
export class DialogService {
  dialogRef?: MatDialogRef<DialogComponent, boolean>;

  constructor(private dialog: MatDialog) { }

  async confirm(
    dialogOptions: ConfirmationDialogOptions
  ): Promise<boolean> {
    // throw an error if a dialog is already open
    if (this.dialogRef !== undefined) {
      const error: BoopError = { errorMessage: "ERROR: dialog already open", statusNumber: 0 };
      throw error;
    }

    this.dialogRef = this.dialog.open(DialogComponent, {
      data: dialogOptions
    });

    const result = await this.dialogRef.afterClosed().pipe(map(response => (response ?? false))).toPromise();
    this.dialogRef = undefined;
    return result;
  }
}
