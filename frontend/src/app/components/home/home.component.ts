import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit {

  constructor(
    private sessionService: SessionService,
    private router: Router,
  ) { }

  getUserID(): string | undefined {
    return this.sessionService.getUserAccountUUID();
  }

  ngOnInit(): void {
    // return user to the landing page if they are not logged in
    // TODO make sure this still behaves correctly after the session service can remember logins between sessions
    if (this.sessionService.getSessionToken() === undefined) {
      void this.router.navigate(["/"]);
    }
  }

}
