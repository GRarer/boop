import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { vapidKeys } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-push-subscribe',
  templateUrl: './push-subscribe.component.html',
  styles: [
  ]
})
export class PushSubscribeComponent implements OnInit {

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
        void this.router.navigate(["/home"]);
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
    const subscription = await this.swPush.requestSubscription({
      serverPublicKey: vapidKeys.publicKey
    });
    console.log(subscription);
    await this.apiService.postJSON<PushSubscriptionJSON, void>(
      "http://localhost:3000/push/addSubscription", subscription.toJSON()
    );
  }
}
