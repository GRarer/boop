import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactMethod, StartChatResult } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';
import { commonPlatforms } from 'src/app/util/platforms';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  info: StartChatResult | undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router,
    private clipboard: Clipboard,
  ) {}

  ngOnInit(): void {
    // token should be provided in the url when the service worker opens this page
    const token: unknown = this.activatedRoute.snapshot.queryParams["token"];
    if (typeof token !== "string") {
      this.snackBar.open("Error: missing notification token", "Dismiss", { "duration": 5000 });
      void this.router.navigate(["/"]);
      return;
    }

    this.apiService.getJSON<StartChatResult>(
      "http://localhost:3000/profile/chat_info", { token })
      .then(result => { this.info = result; })
      .catch(err => { this.apiService.showErrorPopup(err); });
  }

  // make platform icons urls visible to html template
  commonPlatforms = commonPlatforms;

  copyMethod(method: ContactMethod): void {
    this.clipboard.copy(method.contactID);
    this.snackBar.open(
      `Copied ${this.info!.friendlyName}'s ${method.platform} ID to clipboard`, "dismiss",
      { duration: 2000 });
  }
}
