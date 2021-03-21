import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { ContactMethod, CreateAccountRequest, Gender, genderValues, LoginResponse, PrivacyLevel } from 'boop-core';
import { url as gravatarURL } from 'gravatar';
import { DateTime } from 'luxon';
import { RegistrationService } from 'src/app/registration.service';
import { ApiService } from 'src/app/services/api.service';
import { SessionService } from 'src/app/services/session.service';
import {
  PrivacyPolicyDialogComponent
} from '../common/privacy-policy-dialog/privacy-policy-dialog.component';
import { TermsDialogComponent } from '../common/terms-dialog/terms-dialog.component';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class RegistrationComponent implements OnInit {

  @ViewChild('stepper') private stepper?: MatStepper;

  constructor(
    private apiService: ApiService,
    private sessionService: SessionService,
    private swPush: SwPush,
    public dialog: MatDialog,
    private registrationService: RegistrationService,
    private router: Router
  ) { }

  identityForm: FormGroup = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    friendlyName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    birthDate: new FormControl('', [Validators.required]),
    gender: new FormControl(),
  });

  private credentials: {username: string; password: string;} | undefined;

  // configuration for identity form
  genderOptions: Gender[] = genderValues;
  readonly birthdayMax = new Date((new Date().getFullYear() - 12), 11, 31);
  readonly birthdayMin = new Date(1903, 0, 1); // lower bound 1 day older than oldest living person at time of writing

  profileForm: FormGroup = new FormGroup({
    privacyLevel: new FormControl('public', [Validators.required]),
    showAge: new FormControl(true, [Validators.required]),
    showGender: new FormControl(true, [Validators.required]),
    bio: new FormControl(""),
  });


  contactsForm: FormGroup = new FormGroup({
    contactMethods: new FormControl(undefined, [Validators.required]),
  });

  avatarForm: FormGroup = new FormGroup({
    confirmed: new FormControl(undefined, [Validators.required]),
  });

  pushForm: FormGroup = new FormGroup({
    confirmed: new FormControl(undefined, [Validators.required]),
    pushSubscription: new FormControl(undefined),
  });

  agreedToTerms: boolean = false;

  ngOnInit(): void {
    this.credentials = this.registrationService.getCredentials();
    if (this.credentials === undefined) {
      this.apiService.showErrorPopup("Username and password not specified");
      void this.router.navigate(["welcome"]);
    }
  }

  storeContacts(methods: ContactMethod[]): void {
    this.contactsForm.setValue({
      contactMethods: methods
    });
    this.stepper?.next();
  }

  getEmail(): string {
    return `${this.identityForm.controls["email"].value}`;
  }

  getAvatarUrl(): string {
    return gravatarURL(
      this.getEmail(),
      {
        // scale images to 256x256 pixels
        s: "256",
        // if user doesn't have a gravatar, use a placeholder icon chosen based on their email hash
        d: 'identicon',
        // ignore uploaded profile images marked as containing nudity, violence, etc
        rating: 'pg',
      },
    );
  }

  confirmAvatar(): void {
    this.avatarForm.setValue({ confirmed: true });
    this.stepper?.next();
  }

  activateNotifications(): void {
    this.subscribeToNotifications().then(sub => {
      this.pushForm.setValue({
        confirmed: true,
        pushSubscription: sub
      });
      this.stepper?.next();
      console.log(this.pushForm.value);
    }).catch(reason => {
      if (reason instanceof DOMException && reason.name === "NotAllowedError") {
        this.apiService.showErrorPopup("You (or your web browser) blocked permission for push notifications.");
      } else {
        this.apiService.showErrorPopup(reason);
      }
    });
  }

  async subscribeToNotifications(): Promise<PushSubscription> {
    if (!this.swPush.isEnabled) {
      throw "Your platform does not support Web Push Notifications.";
    }
    const publicKey = await this.apiService.getText("push/vapid_public_key");
    const subscription = await this.swPush.requestSubscription({ serverPublicKey: publicKey });
    console.log(subscription);
    return subscription;
  }


  skipNotifications(): void {
    this.pushForm.setValue({
      confirmed: true,
      pushSubscription: "",
    });
    this.stepper?.next();
  }

  showAvatar: boolean = true;

  refreshAvatar(): void {
    this.showAvatar = false;
    setTimeout(() => {
      this.showAvatar = true;
    }, (5));
  }

  showTermsAndConditions(): void {
    this.dialog.open(TermsDialogComponent);
  }

  showPrivacyPolicy(): void {
    this.dialog.open(PrivacyPolicyDialogComponent);
  }

  register(): void {
    console.log([this.identityForm.value, this.profileForm.value, this.contactsForm.value, this.pushForm.value]);

    const credentials = this.credentials;
    if (credentials === undefined) {
      this.apiService.showErrorPopup("Username and password was not specified");
      void this.router.navigate(["welcome"]);
      return;
    }

    const identity: {
      fullName: string;
      friendlyName: string;
      email: string;
      // gender drop-down uses empty string as placeholder for "prefer not to say"
      gender: Gender | "";
      birthDate: Date;
    } = this.identityForm.value;

    const profile: {
      bio: string;
      privacyLevel: PrivacyLevel;
      showAge: boolean;
      showGender: boolean;
    } = this.profileForm.value;

    const contactMethods: ContactMethod[] = this.contactsForm.value["contactMethods"];
    // set to a placeholder value if user skips notifications
    const subscription: unknown = this.pushForm.value["pushSubscription"];

    const request: CreateAccountRequest = {
      username: credentials.username,
      password: credentials.password,
      fullName: identity.fullName,
      friendlyName: identity.friendlyName,
      emailAddress: identity.email,
      gender: identity.gender === "" ? null : identity.gender,
      birthDate: DateTime.fromJSDate(identity.birthDate).toISODate(),
      privacyLevel: profile.privacyLevel,
      profileShowAge: profile.showAge,
      profileShowGender: profile.showGender,
      profileBio: profile.bio,
      contactMethods: contactMethods,
      pushSubscription: subscription instanceof PushSubscription ? subscription.toJSON() : undefined
    };

    this.apiService.postJSON<CreateAccountRequest, LoginResponse>("account/register", request).then(response => {
      this.sessionService.loginFromToken(response);
      this.registrationService.clearCredentials();
      void this.router.navigate(["home"]);
    }).catch(err => this.apiService.showErrorPopup(err));
  }
}
