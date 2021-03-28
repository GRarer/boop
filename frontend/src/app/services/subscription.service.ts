import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwPush } from '@angular/service-worker';
import { ApiService } from './api.service';

// service for subscribing to web push notifications
@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(
    private apiService: ApiService,
    private swPush: SwPush,
    private snackBar: MatSnackBar
  ) { }

  // cached between uses so that we only have to query for this once
  private vapidPublicKey?: string;

  private async getVapidPublicKey(): Promise<string> {
    if (this.vapidPublicKey !== undefined) {
      return this.vapidPublicKey;
    } else {
      const key = await this.apiService.getText("push/vapid_public_key");
      this.vapidPublicKey = key;
      return key;
    }
  }

  // requests and stores the public key so that it will be available immediately the next time it is needed
  preFetchVapidPublicKey(): void {
    // lookup public key, discarding the result and ignoring errors
    void this.getVapidPublicKey();
  }

  webPushSupported(): boolean {
    // check if angular thinks notifications are enabled
    if (!this.swPush.isEnabled) {
      return false;
    }
    // verify that the PushSubscription class is part of the global browser namespace
    try {
      console.log("trying compatibility check");
      // on nonsupporting browsers, this causes an error because the PushSubscription class is undefined
      const neverTrue: boolean = {} instanceof PushSubscription;
      console.log("instance check passed");
      if (neverTrue) {
        // this should never happen
        console.error("empty object found to be an instance of PushSubscription class");
        return false;
      }
    } catch (err) {
      console.warn("PushSubscription API appears unsupported", err);
      return false;
    }
    return true;
  }

  showNotEnabledMessage(): void {
    this.snackBar.open("Your platform or browser does not support Web Push Notifications.", "Dismiss");
  }

  async createSubscription(): Promise<PushSubscriptionJSON> {
    if (!this.webPushSupported()) {
      throw "Your platform or browser does not support Web Push Notifications.";
    }
    const publicKey = await this.getVapidPublicKey();
    try {
      const subscription = await this.swPush.requestSubscription({ serverPublicKey: publicKey });
      return subscription.toJSON();
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "NotAllowedError") {
        throw "You (or your web browser) blocked permission for push notifications.";
      } else {
        throw reason;
      }
    }
  }
}
