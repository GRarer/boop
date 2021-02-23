import { ChangeDetectionStrategy, Component, HostListener, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
})

export class DialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
                  cancelText: string,
                  confirmText: string,
                  message: string,
                  title: string
              }, private mdDialogRef: MatDialogRef<DialogComponent>) { }

  public cancel() {
    this.close(false);
  }

  public close(value: any) {
    this.mdDialogRef.close(value);
  }

  public confirm() {
    this.close(true);
  }

  @HostListener("keydown.esc") 
  public onEsc() {
    this.close(false);
  }
}
