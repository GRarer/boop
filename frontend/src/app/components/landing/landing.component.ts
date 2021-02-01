import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { failsPasswordRequirement, failsUsernameRequirement, LoginRequest } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';
import { SessionService } from 'src/app/services/session.service';
import { equalToSiblingValidator } from 'src/app/util/ngUtils';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {

  // registration page will be shown when this is set
  inProgressRegistration?: LoginRequest;

  constructor(
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private router: Router,
    private apiService: ApiService,
  ) { }

  startRegistrationForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required, equalToSiblingValidator("password")]),
  });

  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  // re-checks whether confirm password matches password and updates control's appearance
  checkConfirmPassword(): void {
    const confirmPassword = this.startRegistrationForm.controls.confirmPassword;
    confirmPassword.updateValueAndValidity();
    confirmPassword.markAsDirty();
    confirmPassword.markAsTouched();
  }

  ngOnInit(): void {
  }

  startRegistration(): void {
    const value = this.startRegistrationForm.value;
    const username: string = value.username;
    const password: string = value.password;
    // enforce username and password rules
    const passwordOrUsernameIssue: string | undefined
      = failsUsernameRequirement(username) ?? failsPasswordRequirement(password);
    if (passwordOrUsernameIssue) {
      this.snackBar.open(passwordOrUsernameIssue, "Dismiss", { "duration": 5000 });
      return;
    }

    // check that username isn't already taken
    // TODO parameterize backend base url
    this.apiService.getJSON<boolean>("http://localhost:3000/account/exists", { username })
      .then(accountExists => {
        if (accountExists) {
          this.snackBar.open("That username is already taken.", "Dismiss", { "duration": 5000 });
        } else {
          // causes registration screen to be shown
          this.inProgressRegistration = { username, password };
        }
      }).catch(() => {
        this.snackBar.open("Something went wrong.", "Dismiss", { "duration": 5000 });
      });
  }

  login(): void {
    if (this.loginForm.valid) {
      const value = this.loginForm.value;
      const username: string = value.username;
      const password: string = value.password;
      this.sessionService.login({ username, password }).then(() => {
        // navigate to home page if login was successful
        void this.router.navigate(["/home"]);
      }).catch((reason: unknown) => {
        // if something went wrong, show a "snackbar" message
        console.error(reason);
        let message: string = "Unknown Error";
        if (reason instanceof HttpErrorResponse) {
          if (reason.status === 401) {
            message = "Incorrect Password";
          } else if (reason.status === 404) {
            message = `Account with username '${username}' not found`;
          } else if (reason.status === 500) {
            message = "Internal Server Error";
          }
        }
        this.snackBar.open(message, "Dismiss", { duration: 5000 });
      });
    }
  }

}
