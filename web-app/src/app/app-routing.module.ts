import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectionExampleComponent } from './connection-example/connection-example.component';

const routes: Routes = [
  { path: '',   redirectTo: '/test', pathMatch: 'full' },
  { path: 'test', component: ConnectionExampleComponent },
  { path: '**', component: ConnectionExampleComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
