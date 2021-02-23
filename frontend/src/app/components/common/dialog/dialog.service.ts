import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { map, take } from 'rxjs/operators';
import { DialogComponent } from './dialog.component';

@Injectable()
export class DialogService {
  dialogRef?: MatDialogRef<DialogComponent>;

  constructor(private dialog: MatDialog) { }


  public open(dialogOptions: any): void {
    this.dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: dialogOptions.title,
        body: dialogOptions.body,
        cancelText: dialogOptions.cancelText,
        confirmText: dialogOptions.confirmText
      }
    });
  }
  public confirmed(): Promise<any> | undefined {
    if (this.dialogRef === undefined) {
      return;
    }

    return this.dialogRef.afterClosed().pipe(take(1), map(res => {
      return res;
    }
    )).toPromise();
  }
}
