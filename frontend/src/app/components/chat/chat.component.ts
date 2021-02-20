import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactMethod, StartChatResult } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { ChatDialogComponent } from './chat-dialog.component';
import { commonPlatforms } from 'src/app/util/platforms';

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
    public dialog: MatDialog
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

  launchMethod(method: ContactMethod): void {
    const selection: ContactMethod & {friendlyName: string;} = {
      platform: method.platform,
      contactID: method.contactID,
      friendlyName: this.info!.friendlyName
    };
    this.dialog.open(ChatDialogComponent, { width: '5in', data: selection });
  }
}
