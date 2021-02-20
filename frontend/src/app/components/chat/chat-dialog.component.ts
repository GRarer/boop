import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ContactMethod } from "boop-core";
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from "@angular/material/snack-bar";
import { commonPlatforms } from "src/app/util/platforms";

@Component({
  selector: 'chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatDialogComponent implements OnInit {

  directLink: string | undefined; // link to the target user's profile on the selected platform
  homepageLink: string | undefined; // link to the homepage of the platform

  constructor(
    public dialogRef: MatDialogRef<ChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public selection: ContactMethod & {friendlyName: string;},
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
  ) {}


  ngOnInit(): void {
    const platform = commonPlatforms[this.selection.platform];
    if (platform?.linkType === "profileLinkTemplate") {
      this.directLink = platform.linkTemplate(this.selection.contactID);
    } else if (platform?.linkType === "homepageLink") {
      this.homepageLink = platform.homepage;
    }
  }

  copyID(): void {
    this.clipboard.copy(this.selection.contactID);
    this.snackBar.open(
      `Copied ${this.selection.friendlyName}'s ${this.selection.platform} ID to clipboard`, "dismiss",
      { duration: 2000 });
  }
}
