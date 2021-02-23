import { ChangeDetectionStrategy, Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export type ConfirmationDialogOptions = {
  cancelText: string;
  confirmText: string;
  body: string;
  title: string;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
})

export class DialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogOptions,
    private mdDialogRef: MatDialogRef<DialogComponent>
  ) { }

  public cancel(): void {
    this.close(false);
  }

  public close(value: any): void {
    this.mdDialogRef.close(value);
  }

  public confirm(): void {
    this.close(true);
  }

  @HostListener("keydown.esc")
  public onEsc(): void {
    this.close(false);
  }
}
