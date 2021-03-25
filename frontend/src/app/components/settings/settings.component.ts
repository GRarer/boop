import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  UpdatePasswordRequest, CurrentSettingsResponse, UpdateAccountRequest, genderValues, Gender, UpdatePrivacyRequest,
  minYearsAgo, AccountDataResponse
} from 'boop-core';
import { ApiService } from 'src/app/services/api.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { equalToSiblingValidator } from 'src/app/util/ngUtils';
import { DialogService } from 'src/app/components/common/dialog/dialog.service';
import { DateTime } from 'luxon';
import { FaqDialogComponent } from '../common/faq-dialog/faq-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { downloadJson } from '../../util/downloads';


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
    private dialogService: DialogService,
    private sessionService: SessionService,
    public dialog: MatDialog,
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

  privacyForm: FormGroup = new FormGroup({
    showAge: new FormControl('', [Validators.required]),
    showGender: new FormControl('', [Validators.required]),
    privacyLevel: new FormControl('', [Validators.required]),
  });

  changePasswordForm: FormGroup = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
    confirmNewPassword: new FormControl('', [Validators.required, equalToSiblingValidator("newPassword")])
  });

  info?: CurrentSettingsResponse;

  downloadProgressVisible: Boolean = false;

  ngOnInit(): void {
    // update privacy settings every time the privacy form is changed
    this.privacyForm.valueChanges.subscribe(() => { this.updatePrivacySettings(); });
    // refresh to load current settings
    this.refresh();
  }

  refresh(): void {
    this.info = undefined;
    this.apiService.getJSON<CurrentSettingsResponse>("account/current_settings", undefined)
      .then((response) => {
        this.updateUserForm.setValue(
          {
            username: response.username,
            gender: response.gender,
            fullName: response.fullName,
            friendlyName: response.friendlyName,
            email: response.emailAddress,
            birthDate: DateTime.fromISO(response.birthDate).toJSDate()
          }
        );
        this.updateUserForm.markAsPristine();
        this.privacyForm.setValue({
          showAge: response.profileShowAge,
          showGender: response.profileShowGender,
          privacyLevel: response.privacyLevel
        }, {
          emitEvent: false // don't trigger updatePrivacySettings()
        });
        this.privacyForm.markAsPristine();
        this.info = response;
      }).catch(err => this.apiService.showErrorPopup(err));
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
    this.apiService.putJSON("account/password", request).then(() => {
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

    const date: Date = value.birthDate;

    if (!minYearsAgo(date, 13)) {
      this.snackBar.open("You must be at least 13 years old.", "Dismiss", { "duration": 5000 });
      return;
    }

    const request: UpdateAccountRequest = {
      username: value.username,
      fullName: value.fullName,
      friendlyName: value.friendlyName,
      emailAddress: value.email,
      birthDate: DateTime.fromJSDate(date).toISODate(),
      // form value for gender is empty string if user chose "prefer not so say", and we have to replace that with null
      gender: value.gender || null
    };
    this.apiService.putJSON("account/edit", request).then(() => {
      this.snackBar.open("Account Updated.", "Dismiss", { "duration": 5000 });
      this.refresh();
    }).catch((error) => {
      this.apiService.showErrorPopup(error);
    });
  }

  updatePrivacySettings(): void {
    const value = this.privacyForm.value;
    const request: UpdatePrivacyRequest = {
      profileShowAge: value.showAge,
      profileShowGender: value.showGender,
      privacyLevel: value.privacyLevel
    };
    this.apiService.putJSON("account/privacy", request)
      .catch(err => { this.apiService.showErrorPopup(err); });
  }

  downloadAccountData(): void {
    this.downloadProgressVisible = true;
    this.apiService.getJSON<AccountDataResponse>("account/data", undefined).then((response) => {
      const name = response.username + '-data';
      const beautified = JSON.stringify(response, null, "\t");
      downloadJson(beautified, name);
    }).catch((error) => {
      this.apiService.showErrorPopup(error);
    }).finally(() => {
      this.downloadProgressVisible = false;
    });
  }

  startDelete(): void {
    this.confirmDelete().catch(err => this.apiService.showErrorPopup(err));
  }

  private async confirmDelete(): Promise<void> {
    const data = {
      title: 'Confirm Delete',
      body: 'Are you sure you want to delete your account? This action cannot be undone',
      cancelText: 'CANCEL',
      confirmText: 'CONFIRM',
    };

    const confirmed = await this.dialogService.confirm(data);

    if (confirmed) {
      await this.apiService.deleteJSON("account/delete");
      await this.sessionService.logout();
      void this.router.navigate(["/welcome"]);
    }
  }

  // re-checks whether confirm password matches password and updates control's appearance
  checkConfirmPassword(): void {
    const confirmNewPassword = this.changePasswordForm.controls.confirmNewPassword;
    confirmNewPassword.updateValueAndValidity();
    confirmNewPassword.markAsDirty();
    confirmNewPassword.markAsTouched();
  }

  showFAQ(): void {
    this.dialog.open(FaqDialogComponent, { autoFocus: false, maxWidth: "8in" });
  }
}
