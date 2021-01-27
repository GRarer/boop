import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styles: [
  ]
})
export class SettingsComponent implements OnInit {

  constructor(
    private sessionService: SessionService,
    private router: Router,
  ) { }

  updateUserForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
  });

  getUserID(): string | undefined {
    return this.sessionService.getUserAccountUUID();
  }

  ngOnInit(): void {
  }

  updateUserInfo(): void {

  }
}
