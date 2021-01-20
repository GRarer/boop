import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CreateAccountRequest, Gender, genderValues, LoginRequest, toIsoDate, minYearsAgo } from 'boop-core';
import { SessionService } from 'src/app/services/session.service';

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
    fullName: new FormControl('', [Validators.required]),
    friendlyName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    birthDate: new FormControl('', [Validators.required]),
    gender: new FormControl(),
  });

  constructor(
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }

  register(): void {
    const value = this.registerForm.value;
    const fullName: string = value.fullName;
    const friendlyName: string = value.friendlyName;
    const emailAddress: string = value.friendlyName;
    // form value for gender is empty string if user chose "prefer not so say", or undefined if they did not choose
    // in either of those cases, we replace that with null
    const gender: Gender = value.gender || null;
    const birthDate = toIsoDate(value.birthDate);
    if (!minYearsAgo(value.birthDate, 13)) {
      this.snackBar.open("You must be at least 13 years old.", "Dismiss", { duration: 5000 });
      return;
    }

    const request: CreateAccountRequest = {
      username: this.credentials!.username,
      password: this.credentials!.password,
      fullName,
      friendlyName,
      emailAddress,
      gender,
      birthDate,
    };
    this.sessionService.loginNewAccount(request).then(() => {
      void this.router.navigate(["/home"]);
    }).catch((reason) => {
      // if something went wrong, show a "snackbar" message
      console.error(reason);
      let message: string = "Unknown Error";
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

  ngOnInit(): void {
  }
}
