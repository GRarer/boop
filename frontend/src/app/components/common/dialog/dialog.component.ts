import { ChangeDetectionStrategy, Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
})

export class DialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    cancelText: string;
    confirmText: string;
    message: string;
    title: string;
  }, private mdDialogRef: MatDialogRef<DialogComponent>) { }

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
