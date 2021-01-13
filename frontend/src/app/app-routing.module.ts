import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectionExampleComponent } from './components/connection-example/connection-example.component';
import { LandingComponent } from './components/landing/landing.component';
import { NotFound404Component } from './components/not-found404/not-found404.component';
/* eslint-disable @typescript-eslint/no-extraneous-class */
const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },
  { path: 'test', component: ConnectionExampleComponent },
  { path: '**', component: NotFound404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
