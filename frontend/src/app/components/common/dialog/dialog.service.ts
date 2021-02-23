import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { DialogComponent } from './dialog.component';

@Injectable()
export class DialogService {
  dialogRef?: MatDialogRef<DialogComponent>;

  constructor(private dialog: MatDialog) { }


  public open(title: string, message: string, cancelText: string, confirmText: string): void {
    this.dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: title,
        message: message,
        cancelText: cancelText,
        confirmText: confirmText
      }
    });
  }
  public confirmed(): Observable<any> | undefined {
    if (this.dialogRef === undefined) {
      return;
    }

    return this.dialogRef.afterClosed().pipe(take(1), map(res => {
      return res;
    }
    ));
  }
}
