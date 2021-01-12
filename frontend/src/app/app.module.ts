import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConnectionExampleComponent } from './connection-example/connection-example.component';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// since there will be dozens of material design component dependencies, please add them in materialDependencies.ts
// instead of importing them all to AppModule separately
import { materialModules } from './materialDependencies';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotFound404Component } from './not-found404/not-found404.component';
import { LandingComponent } from './landing/landing.component';

/* eslint-disable @typescript-eslint/no-extraneous-class */
@NgModule({
  declarations: [
    AppComponent,
    ConnectionExampleComponent,
    NotFound404Component,
    LandingComponent,
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
