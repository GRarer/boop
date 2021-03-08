import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CreateAccountRequest, Gender, genderValues, LoginRequest, minYearsAgo } from 'boop-core';
import { DateTime } from 'luxon';
import { ApiService } from 'src/app/services/api.service';
import { SessionService } from 'src/app/services/session.service';
import { PrivacyPolicyDialogComponent } from './privacy-policy-dialog/privacy-policy-dialog.component';
import { TermsDialogComponent } from './terms-dialog/terms-dialog.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  @Input() credentials?: LoginRequest;
  @Output() cancelRegistration = new EventEmitter<void>();

  genderOptions: Gender[] = genderValues;

  registerForm: FormGroup = new FormGroup({
    // user info
    fullName: new FormControl('', [Validators.required]),
    friendlyName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    birthDate: new FormControl('', [Validators.required]),
    gender: new FormControl(),
    // privacy settings
    privacyLevel: new FormControl('public', [Validators.required]),
    showAge: new FormControl(true, [Validators.required]),
    showGender: new FormControl(true, [Validators.required]),
    // user must check box to agree to terms
    agreeToTerms: new FormControl(false, [Validators.requiredTrue]),
  });

  readonly birthdayMax = new Date((new Date().getFullYear() - 12), 11, 31);
  readonly birthdayMin = new Date(1903, 0, 1); // lower bound 1 day older than oldest living person at time of writing


  constructor(
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog,
    private apiService: ApiService
  ) { }

  register(): void {
    const value = this.registerForm.value;

    // form value for gender is empty string if user chose "prefer not so say", or undefined if they did not choose
    // in either of those cases, we replace that with null
    const gender: Gender = value.gender || null;


    if (!minYearsAgo(value.birthDate, 13)) {
      this.snackBar.open("You must be at least 13 years old.", "Dismiss", { duration: 5000 });
      return;
    }

    const request: CreateAccountRequest = {
      username: this.credentials!.username,
      password: this.credentials!.password,
      fullName: value.fullName,
      friendlyName: value.friendlyName,
      emailAddress: value.email,
      gender,
      birthDate: DateTime.fromJSDate(value.birthDate).toISODate(),
      privacyLevel: value.privacyLevel,
      profileShowAge: value.showAge,
      profileShowGender: value.showGender,
    };
    this.sessionService.loginNewAccount(request).then(() => {
      void this.router.navigate(["/onboarding"]);
    }).catch((reason) => {
      this.apiService.showErrorPopup(reason);
    });
  }

  showTermsAndConditions(): void {
    this.dialog.open(TermsDialogComponent);
  }

  showPrivacyPolicy(): void {
    this.dialog.open(PrivacyPolicyDialogComponent);
  }

  ngOnInit(): void {
  }
}
