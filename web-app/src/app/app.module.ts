import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConnectionExampleComponent } from './connection-example/connection-example.component';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
/* eslint-disable @typescript-eslint/no-extraneous-class */
@NgModule({
  declarations: [
    AppComponent,
    ConnectionExampleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: true }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
