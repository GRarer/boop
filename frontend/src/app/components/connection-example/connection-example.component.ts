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
    this.apiService.getJSON<string>("http://localhost:3000/example/foobar").subscribe(
      (result) => console.log("get result", result)
    );
  }

  testPost(): void {
    const body = {
      foo: "bar",
      baz: 42,
    };
    this.apiService.postJSON<{}, string>("http://localhost:3000/example/", body).subscribe();
  }

  unsubscribe(): void {
    this.swPush.unsubscribe()
      .then(sub => console.log("unsubscribed"))
      .catch(err => console.error("Could not unsubscribe", err));
  }

  subscribeToNotifications(): void {
    console.log("subscribe");
    this.swPush.requestSubscription({
      serverPublicKey: this.subscriptionService.VAPID_PUBLIC_KEY
    })
      .then(sub => this.subscriptionService.addPushSubscriber(sub).subscribe())
      .catch(err => console.error("Could not subscribe to notifications", err));
  }

  broadcast(): void {
    console.log("trigger broadcast");
    this.apiService.postJSON("http://localhost:3000/push/testBroadcast", {}).subscribe();
  }

  newEntry: string = "";

  sqlAdd(): void {
    console.log("sending value to database");
    console.log(this.newEntry);
    this.apiService.postJSON<string, void>("http://localhost:3000/db_example", this.newEntry).subscribe();
  }

  sqlSelect(): void {
    this.apiService.getJSON<string[]>("http://localhost:3000/db_example")
      .subscribe(response => {
        console.log("database result");
        console.log(response);
      });
  }
}
