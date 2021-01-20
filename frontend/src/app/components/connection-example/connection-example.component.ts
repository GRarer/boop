import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { ApiService } from '../../services/api.service';
import { NotificationSubscriptionService } from '../../services/notification-subscription.service';

@Component({
  selector: 'app-connection-example',
  templateUrl: './connection-example.component.html',
  styleUrls: ['./connection-example.component.css']
})
// TODO references to localhost will have to be changed when deployed to the web
export class ConnectionExampleComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private swPush: SwPush,
    private subscriptionService: NotificationSubscriptionService,
  ) { }

  ngOnInit(): void {
    this.swPush.notificationClicks.subscribe( event => {
      console.log(`Notification Action: ${event.action}`);
      if (event.action === "show_app") {
        window.open("http://localhost:8080");
      }
    });
  }

  testGet(): void {
    this.apiService.getJSON<string>("http://localhost:3000/example/foobar").then(
      (result) => console.log("get result", result)
    )
      .catch(reason => { console.error(reason); });
  }

  testPost(): void {
    const body = {
      foo: "bar",
      baz: 42,
    };
    this.apiService.postJSON<typeof body, unknown>("http://localhost:3000/example/", body)
      .then(response => { console.log(response); })
      .catch(reason => { console.error(reason); });
  }

  unsubscribe(): void {
    this.swPush.unsubscribe()
      .then(sub => console.log("unsubscribed"))
      .catch(err => console.error("Could not unsubscribe", err));
  }

  private async sendNotificationSubscription(): Promise<void> {
    const subscription = await this.swPush.requestSubscription({
      serverPublicKey: this.subscriptionService.VAPID_PUBLIC_KEY
    });
    await this.subscriptionService.addPushSubscriber(subscription);
  }

  subscribeToNotifications(): void {
    console.log("subscribe");
    this.sendNotificationSubscription()
      .then(() => { console.log("subscribed"); })
      .catch(reason => { console.error(reason); });
  }

  broadcast(): void {
    console.log("trigger broadcast");
    this.apiService.postJSON("http://localhost:3000/push/testBroadcast", {})
      .then()
      .catch(reason => { console.error(reason); });
  }

  newEntry: string = "";

  sqlAdd(): void {
    console.log("sending value to database");
    console.log(this.newEntry);
    this.apiService.postJSON<string, void>("http://localhost:3000/db_example", this.newEntry)
      .then()
      .catch(reason => console.error(reason));
  }

  sqlSelect(): void {
    this.apiService.getJSON<string[]>("http://localhost:3000/db_example")
      .then(response => {
        console.log("database result");
        console.log(response);
      })
      .catch(reason => console.error(reason));
  }
}
