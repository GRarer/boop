import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectionExampleComponent } from './connection-example/connection-example.component';

const routes: Routes = [
  { path: '',   redirectTo: '/test', pathMatch: 'full' },
  { path: 'test', component: ConnectionExampleComponent },
  // TODO add wildcard page { path: '**', component: 404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
