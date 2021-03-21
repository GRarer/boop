import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { EditContactInfoComponent } from './components/edit-contact-info/edit-contact-info.component';
import { FriendsComponent } from './components/friends/friends.component';
import { HomeComponent } from './components/home/home.component';
import { LandingComponent } from './components/landing/landing.component';
import { NotFound404Component } from './components/not-found404/not-found404.component';
import { ProfileEditorComponent } from './components/profile-editor/profile-editor.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PushSubscribeComponent } from './components/push-subscribe/push-subscribe.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { SettingsComponent } from './components/settings/settings.component';

/* eslint-disable @typescript-eslint/no-extraneous-class */
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'welcome', component: LandingComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'home', component: HomeComponent },
  { path: 'push_setup', component: PushSubscribeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'edit_contact_info', component: EditContactInfoComponent },
  { path: 'add_friends', component: FriendsComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'profile/:username', component: ProfileComponent },
  { path: 'edit_profile', component: ProfileEditorComponent },
  { path: '**', component: NotFound404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
