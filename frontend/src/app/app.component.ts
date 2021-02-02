import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommandsService } from './services/commands.service';
import { SessionService } from './services/session.service';

// a minimal component that acts as the root of the page
@Component({
  selector: 'app-root',
  template: `
  <h1 class="boop-header mat-display-1">Boop</h1>
  <app-loading-bar *ngIf="initialLoading"></app-loading-bar>
  <router-outlet *ngIf="!initialLoading"></router-outlet>
  `,
  styles: []
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
        console.log("loaded saved session", savedLoaded);
        if (!savedLoaded) {
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
