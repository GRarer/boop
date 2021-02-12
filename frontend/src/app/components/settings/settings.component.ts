import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpdatePasswordRequest, UserAccountResponse, UpdateAccountRequest, genderValues, Gender } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { equalToSiblingValidator } from 'src/app/util/ngUtils';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
  ) {}

  genderOptions: Gender[] = genderValues;

  updateUserForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    gender: new FormControl(),
    fullName: new FormControl('', [Validators.required]),
    friendlyName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    birthDate: new FormControl('', [Validators.required]),
  });

  changePasswordForm: FormGroup = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
    confirmNewPassword: new FormControl('', [Validators.required, equalToSiblingValidator("newPassword")])
  });

  isLoading: boolean = true;

  ngOnInit(): void {
    this.refresh();
  }

  private refresh(): void {
    this.isLoading = true;
    void this.apiService.getJSON<UserAccountResponse>("http://localhost:3000/account/info", undefined)
      .then((response) => {
        this.updateUserForm.setValue(
          {
            username: response.username,
            gender: response.gender,
            fullName: response.fullName,
            friendlyName: response.friendlyName,
            email: response.emailAddress,
            birthDate: response.birthDate,
          }
        );
        this.updateUserForm.markAsPristine();
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
    this.changePasswordForm.reset();
    this.apiService.putJSON("http://localhost:3000/account/password", request).then(() => {
      this.snackBar.open("Password updated", "Dismiss", { duration: 5000 });
    }).catch((error) => {
      this.apiService.showErrorPopup(error);
    });
  }

  updateUserInfo(): void {
    if (!this.updateUserForm.valid || this.updateUserForm.pristine) {
      return;
    }

    const value = this.updateUserForm.value;
    console.log(value);

    const request: UpdateAccountRequest = {
      username: value.username,
      fullName: value.fullName,
      friendlyName: value.friendlyName,
      emailAddress: value.email,
      birthDate: value.birthDate,
      gender: value.gender
    };

    this.apiService.putJSON("http://localhost:3000/account/edit", request).then(() => {
      this.snackBar.open("Account Updated.", "Dismiss", { "duration": 5000 });
      this.refresh();
    }).catch((error) => {
      this.apiService.showErrorPopup(error);
    });
  }

  // re-checks whether confirm password matches password and updates control's appearance
  checkConfirmPassword(): void {
    const confirmNewPassword = this.changePasswordForm.controls.confirmNewPassword;
    confirmNewPassword.updateValueAndValidity();
    confirmNewPassword.markAsDirty();
    confirmNewPassword.markAsTouched();
  }
}