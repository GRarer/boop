import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationSubscriptionService {

  constructor(
    private apiService: ApiService,
  ) { }

  async addPushSubscriber(sub: PushSubscription): Promise<void> {
    console.log("making subscription");
    console.log(sub);
    return this.apiService.postJSON("http://localhost:3000/push/subscribe", sub);
  }
}
