import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommandsService } from '../../services/commands.service';
import { SessionService } from '../../services/session.service';

// a minimal component that acts as the root of the page
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  initialLoading: boolean = true;

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private snackBar: MatSnackBar,
    private commandService: CommandsService,
  ) { }

  ngOnInit(): void {
    // attach admin debug commands to browser console
    this.commandService.enableAdminCommands();

    this.sessionService.loadSavedSession().then(
      (savedLoaded) => {
        // do not require login to visit certain pages
        const pathExemptFromLogin = [
          /^\/chat$/g,
          /^\/profile\//g
        ].some(regex => regex.test(window.location.pathname));
        if (!savedLoaded && !pathExemptFromLogin) {
          void this.router.navigate(["/welcome"]).finally(() => { this.initialLoading = false; });
        } else {
          this.initialLoading = false;
        }
      }
    )
      .catch((err: unknown) => {
        console.error(err);
        this.initialLoading = false;
        this.snackBar.open("Error: Could not connect to server.", "Dismiss");
      });
  }

}
