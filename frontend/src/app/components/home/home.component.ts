import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommandsService } from 'src/app/services/commands.service';
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
    private snackBar: MatSnackBar,
    private commandService: CommandsService
  ) { }

  getUserID(): string | undefined {
    return this.sessionService.getUserAccountUUID();
  }

  ngOnInit(): void {
    // return user to the landing page if they are not logged in
    // TODO make sure this still behaves correctly after the session service can remember logins between sessions
    if (this.sessionService.getSessionToken() === undefined) {
      void this.router.navigate(["/welcome"]);
    }
    // attach admin debug commands to browser console
    this.commandService.enableAdminCommands();
  }

  logout(): void {
    this.sessionService.logout().then(
      () => { void this.router.navigate(["/welcome"]); }
    ).catch((reason) => {
      console.error(reason);
      this.snackBar.open("Something went wrong when trying to log out.", "Dismiss", { "duration": 5000 });
    });
  }

}
