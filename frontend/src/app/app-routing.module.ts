import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectionExampleComponent } from './connection-example/connection-example.component';
import { NotFound404Component } from './not-found404/not-found404.component';
/* eslint-disable @typescript-eslint/no-extraneous-class */
const routes: Routes = [
  { path: '', redirectTo: '/test', pathMatch: 'full' },
  { path: 'test', component: ConnectionExampleComponent },
  { path: '**', component: NotFound404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
