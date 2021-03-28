import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SubscriptionService } from 'src/app/services/subscription.service';

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
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar,
    private subscriptionService: SubscriptionService
  ) { }

  ngOnInit(): void {
    this.subscriptionService.preFetchVapidPublicKey();
  }

  activateNotifications(): void {
    if (!this.subscriptionService.webPushSupported()) {
      this.subscriptionService.showNotEnabledMessage();
      return;
    }
    this.subscribe()
      .then(() => {
        this.snackBar.open("Push Notifications Enabled", "Dismiss", { duration: 3000, });
        this.navigateToNext();
      })
      .catch((reason) => {
        this.apiService.showErrorPopup(reason);
      });
  }

  private async subscribe(): Promise<void> {
    const subscriptionJSON = await this.subscriptionService.createSubscription();
    await this.apiService.postJSON<PushSubscriptionJSON, void>(
      "push/addSubscription", subscriptionJSON
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
