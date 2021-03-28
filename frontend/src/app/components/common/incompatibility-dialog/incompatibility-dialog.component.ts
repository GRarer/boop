import { Component, OnInit } from '@angular/core';

export const skipIncompatibilityLSKey = "boop-skip-incompatibility-dialog";

@Component({
  selector: 'app-incompatibility-dialog',
  templateUrl: './incompatibility-dialog.component.html',
  styles: ['h2 {margin-bottom: 0}']
})
export class IncompatibilityDialogComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  dontShowAgain(): void {
    window.localStorage.setItem(skipIncompatibilityLSKey, "skip");
  }

}
