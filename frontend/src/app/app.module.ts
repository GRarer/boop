import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// since there will be dozens of material design component dependencies, please add them in materialDependencies.ts
// instead of importing them all to AppModule separately
import { materialModules } from './materialDependencies';

import { NotFound404Component } from './components/not-found404/not-found404.component';
import { LandingComponent } from './components/landing/landing.component';
import { ConnectionExampleComponent } from './components/connection-example/connection-example.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/landing/register/register.component';
import { TermsDialogComponent } from './components/landing/register/terms-dialog/terms-dialog.component';
import { PrivacyPolicyDialogComponent }
  from './components/landing/register/privacy-policy-dialog/privacy-policy-dialog.component';

/* eslint-disable @typescript-eslint/no-extraneous-class */
@NgModule({
  declarations: [
    AppComponent,
    ConnectionExampleComponent,
    NotFound404Component,
    LandingComponent,
    HomeComponent,
    RegisterComponent,
    TermsDialogComponent,
    PrivacyPolicyDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: true }),
    BrowserAnimationsModule,
    ...materialModules, // modules for angular-material components
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
