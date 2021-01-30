import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserAccountResponse, UpdateAccountRequest } from 'boop-core'
import { SessionService } from 'src/app/services/session.service';
import { ApiService } from 'src/app/services/api.service';
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
    private apiService: ApiService,
  ) {}

  userFormData = {
    username: new FormControl('', [Validators.required]),
    gender: new FormControl(),
    fullName: new FormControl('', [Validators.required]),
    friendlyName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    birthDate: new FormControl('', [Validators.required]),  
  };

  updateUserForm: FormGroup = new FormGroup(this.userFormData);

  getUserID(): string | undefined {
    return this.sessionService.getUserAccountUUID();
  }

  ngOnInit(): void {
    this.apiService.getJSON("http://localhost:3000/account/info", undefined).then((response) => {
      this.userFormData.username.setValue((<UserAccountResponse> response).username); 
      this.userFormData.gender.setValue((<UserAccountResponse> response).gender); 
      this.userFormData.fullName.setValue((<UserAccountResponse> response).fullName); 
      this.userFormData.friendlyName.setValue((<UserAccountResponse> response).friendlyName); 
      this.userFormData.email.setValue((<UserAccountResponse> response).emailAddress); 
      this.userFormData.birthDate.setValue((<UserAccountResponse> response).birthDate); 
    }); 
  }

  updateUserInfo(): void {
    const value = this.updateUserForm.value;
    const username = value.username;
    const gender = value.gender;
    const fullName = value.fullName;
    const friendlyName = value.friendlyName;
    const email = value.email;
    const birthDate = value.birthDate;

    const request: UpdateAccountRequest = {
      username: username,
      fullName: fullName,
      friendlyName: friendlyName,
      emailAddress: email,
      birthDate: birthDate,
      gender: gender
    };

    this.apiService.putJSON("http://localhost:3000/account/edit", request).then((response) => {
      console.log(response);
    });
  }
}
