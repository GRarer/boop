import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-push-subscribe',
  templateUrl: './push-subscribe.component.html',
  styles: [
  ]
})
export class PushSubscribeComponent implements OnInit {

  @Input() onboardingMode: boolean = false;
  @Output() done = new EventEmitter<void>();

  constructor(
    private swPush: SwPush,
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
  }

  activateNotifications(): void {
    if (!this.swPush.isEnabled) {
      this.snackBar.open("Your platform does not support Web Push Notifications.", "Dismiss", { duration: 5000 });
      return;
    }
    this.subscribe()
      .then(() => {
        this.snackBar.open("Push Notifications Enabled", "Dismiss", { duration: 3000, });
        this.navigateToNext();
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "NotAllowedError") {
          this.snackBar.open(
            "You (or your web browser) blocked permission for push notifications.",
            "Dismiss", { duration: 5000 }
          );
        } else {
          this.apiService.showErrorPopup(reason);
        }
      }
      );
  }

  private async subscribe(): Promise<void> {
    const publicKey = await this.apiService.getText("push/vapid_public_key");
    const subscription = await this.swPush.requestSubscription({ serverPublicKey: publicKey });
    await this.apiService.postJSON<PushSubscriptionJSON, void>(
      "push/addSubscription", subscription.toJSON()
    );
  }

  // emit event if onboarding mode is enabled, else navigate to home
  navigateToNext(): void {
    if (this.onboardingMode) {
      this.done.emit();
    } else {
      void this.router.navigate(["/home"]);
    }
  }
}
