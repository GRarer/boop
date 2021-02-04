import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpdatePasswordRequest, UserAccountResponse, UpdateAccountRequest, genderValues, Gender } from 'boop-core';
import { SessionService } from 'src/app/services/session.service';
import { ApiService } from 'src/app/services/api.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
  ) {}

  genderOptions: Gender[] = genderValues;

  userFormData = {
    username: new FormControl('', [Validators.required]),
    gender: new FormControl(),
    fullName: new FormControl('', [Validators.required]),
    friendlyName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    birthDate: new FormControl('', [Validators.required]),
  };

  passwordFormData = {
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
    confirmNewPassword: new FormControl('', [Validators.required])
  };

  updateUserForm: FormGroup = new FormGroup(this.userFormData);
  changePasswordForm: FormGroup = new FormGroup(this.passwordFormData);
  isLoading: Boolean = true;

  ngOnInit(): void {
    void this.apiService.getJSON("http://localhost:3000/account/info", undefined).then((response) => {
      this.userFormData.username.setValue((response as UserAccountResponse).username);
      this.userFormData.gender.setValue((response as UserAccountResponse).gender);
      this.userFormData.fullName.setValue((response as UserAccountResponse).fullName);
      this.userFormData.friendlyName.setValue((response as UserAccountResponse).friendlyName);
      this.userFormData.email.setValue((response as UserAccountResponse).emailAddress);
      this.userFormData.birthDate.setValue((response as UserAccountResponse).birthDate);
      this.isLoading = false;
    }).catch((error) => {
      console.error(error);
      this.snackBar.open(
        "Something went wrong when trying to load your information.",
        "Dismiss",
        { "duration": 5000 }
      );
    });
  }

  updatePassword(): void {
    const value = this.changePasswordForm.value;
    const newPassword = value.newPassword;
    const confirmNewPassword = value.confirmNewPassword;
    const oldPassword = value.oldPassword;

    if (confirmNewPassword !== newPassword) {
      this.snackBar.open("Passwords don't match", "Dismiss", { duration: 5000 });
      return;
    }

    const request: UpdatePasswordRequest = {
      oldPassword: oldPassword,
      newPassword: newPassword
    };

    this.apiService.putJSON("http://localhost:3000/account/password", request).then(() => {
      this.snackBar.open("Password updated", "Dismiss", { duration: 5000 });
    }).catch((error) => {
      this.snackBar.open(error.message, "Dismiss", { duration: 5000 });
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

    this.apiService.putJSON("http://localhost:3000/account/edit", request).then(() => {
      void this.router.navigate(["/home"]);
    }).catch((reason) => {
      console.error(reason);
      let message: string = reason.error;
      if (reason instanceof HttpErrorResponse) {
        if (reason.status === 409) {
          message = "Username is already taken";
        } else if (reason.status === 500) {
          message = "Internal Server Error";
        }
      }
      this.snackBar.open(message, "Dismiss", { duration: 5000 });
    });
  }
}
