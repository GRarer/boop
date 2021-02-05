import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FriendsComponent } from './components/friends/friends.component';
import { HomeComponent } from './components/home/home.component';
import { LandingComponent } from './components/landing/landing.component';
import { NotFound404Component } from './components/not-found404/not-found404.component';
import { PushSubscribeComponent } from './components/push-subscribe/push-subscribe.component';
import { SettingsComponent } from './components/settings/settings.component';
/* eslint-disable @typescript-eslint/no-extraneous-class */
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'welcome', component: LandingComponent },
  { path: 'home', component: HomeComponent },
  { path: 'push_setup', component: PushSubscribeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'add_friends', component: FriendsComponent },
  { path: '**', component: NotFound404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
