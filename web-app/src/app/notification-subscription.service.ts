import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationSubscriptionService {

  constructor(
    private apiService: ApiService,
  ) { }

  readonly VAPID_PUBLIC_KEY = "BHFciY9_wuokC43Tkd7g4bPYctnTFlqc1rHzKgShdTxE2_AJFAvSJz1q3QXf4OQKDp0CcrDM4CK8mIPfG17iv78";

  addPushSubscriber(sub: PushSubscription): Observable<void> {
    console.log("making subscription");
    console.log(sub);
    return this.apiService.postJSON("http://localhost:3000/push/subscribe", sub);
  }
}
