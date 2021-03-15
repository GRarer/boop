import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HomeScreenInfoResponse } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  info: HomeScreenInfoResponse | undefined;

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private snackBar: MatSnackBar,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
  // return user to the landing page if they are not logged in
    if (this.sessionService.getSessionToken() === undefined) {
      void this.router.navigate(["/welcome"]);
      return;
    }
    this.loadInfo();
  }

  loadInfo(): void {
    this.info = undefined;
    this.apiService.getJSON<HomeScreenInfoResponse>("user_info/home_info")
      .then(info => {
        this.info = info;
      })
      .catch(err => {
        this.apiService.showErrorPopup(err);
        this.logout();
      });
  }

  updateStatus(): void {
    this.apiService.putJSON<string, void>("user_info/update_status", this.info!.statusMessage)
      .then(() => {
        const popupMessage = this.info!.statusMessage ? "Status updated" : "Status cleared";
        this.snackBar.open(popupMessage, "Dismiss", { duration: 2500 });
      })
      .catch(err => {
        this.apiService.showErrorPopup(err);
        this.loadInfo();
      });
  }

  updateDoNotDisturb(): void {
    this.apiService.putJSON<boolean, void>(
      "user_info/update_do_not_disturb",
      this.info!.doNotDisturb
    ).catch(err => {
      this.apiService.showErrorPopup(err);
      this.loadInfo();
    });
  }

  removeStatus(): void {
    this.info!.statusMessage = "";
    this.updateStatus();
  }

  navigateToProfile(): void {
    void this.router.navigate(["/profile", this.info!.username]);
  }

  logout(): void {
    this.sessionService.logout().then(
      () => { void this.router.navigate(["/welcome"]); }
    ).catch((reason) => {
      this.apiService.showErrorPopup(reason);
    });
  }

  // a greeting appropriate for the time of day, e.g. "Good Morning, Alice"
  getGreeting(name: string): string {
    const hour = (new Date()).getHours();
    if (hour < 6 || hour >= 18) {
      return `Good evening, ${name}`;
    } else if (hour < 12) {
      return `Good morning, ${name}`;
    } else {
      return `Good afternoon, ${name}`;
    }
  }
}
