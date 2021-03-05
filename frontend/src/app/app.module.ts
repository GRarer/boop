import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
// since there will be dozens of material design component dependencies, please add them in materialDependencies.ts
// instead of importing them all to AppModule separately
import { materialModules } from './materialDependencies';

import { NotFound404Component } from './components/not-found404/not-found404.component';
import { LandingComponent } from './components/landing/landing.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/landing/register/register.component';
import { TermsDialogComponent } from './components/landing/register/terms-dialog/terms-dialog.component';
import { PrivacyPolicyDialogComponent }
  from './components/landing/register/privacy-policy-dialog/privacy-policy-dialog.component';
import { PushSubscribeComponent } from './components/push-subscribe/push-subscribe.component';
import { SettingsComponent } from './components/settings/settings.component';
import { FriendsComponent } from './components/friends/friends.component';
import { LoadingBarComponent } from './components/common/loading-bar/loading-bar.component';
import { EditContactInfoComponent } from './components/edit-contact-info/edit-contact-info.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { FriendRequestComponent } from './components/friends/friend-request/friend-request.component';
import { Header } from './components/common/header/heading.component';
import { ChatComponent } from './components/chat/chat.component';
import { DialogComponent } from './components/common/dialog/dialog.component';
import { DialogService } from './components/common/dialog/dialog.service';
import { AvatarOnboardingComponent } from './components/onboarding/avatar-onboarding/avatar-onboarding.component';
import { PrivacyControlsComponent } from './components/settings/privacy-controls/privacy-controls.component';


/* eslint-disable @typescript-eslint/no-extraneous-class */
@NgModule({
  declarations: [
    AppComponent,
    NotFound404Component,
    LandingComponent,
    HomeComponent,
    RegisterComponent,
    TermsDialogComponent,
    PrivacyPolicyDialogComponent,
    PushSubscribeComponent,
    SettingsComponent,
    FriendsComponent,
    LoadingBarComponent,
    EditContactInfoComponent,
    OnboardingComponent,
    FriendRequestComponent,
    Header,
    ChatComponent,
    DialogComponent,
    AvatarOnboardingComponent,
    PrivacyControlsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('boop-service-worker.js', { enabled: true }),
    BrowserAnimationsModule,
    ClipboardModule,
    ...materialModules, // modules for angular-material components
  ],
  providers: [DialogService],
  bootstrap: [AppComponent]
})
export class AppModule { }
