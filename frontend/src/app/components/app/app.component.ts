import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { CommandsService } from '../../services/commands.service';
import { SessionService } from '../../services/session.service';
import {
  IncompatibilityDialogComponent,
  skipIncompatibilityLSKey
} from '../common/incompatibility-dialog/incompatibility-dialog.component';

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
    private subscriptionService: SubscriptionService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    // attach admin debug commands to browser console
    this.commandService.enableAdminCommands();

    if (!this.subscriptionService.webPushSupported() && !window.localStorage.getItem(skipIncompatibilityLSKey)) {
      this.dialog.open(IncompatibilityDialogComponent, { autoFocus: false, maxWidth: "8in" });
    }

    // retrieve saved session is it exists
    this.sessionService.loadSavedSession().then(
      (savedLoaded) => {
        // do not require login to visit certain pages
        const pathExemptFromLogin = [
          /^\/register$/g,
          /^\/chat$/g,
          /^\/profile\//g
        ].some(regex => regex.test(window.location.pathname));
        if (!savedLoaded && !pathExemptFromLogin) {
          // if user not logged in and page requires being logged in, redirect to landing page
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
