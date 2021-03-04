import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-privacy-controls',
  templateUrl: './privacy-controls.component.html',
  styles: [
  ]
})
export class PrivacyControlsComponent implements OnInit {

  // the privacy control cards are meant to be embedded in a page like the settings page or registration page
  // the formGroup must have controls named 'privacyLevel', 'showAge', and 'showGender'
  @Input() formGroup?: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

}
