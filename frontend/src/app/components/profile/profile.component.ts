import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactMethod, Profile, ProfileResponse, ProfileSummary } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';
import { commonPlatforms } from 'src/app/util/platforms';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  loading: boolean = true;
  denialReason: string | undefined; // reason why page is not visible
  profile?: Profile; // info to display if page is visible

  // make platform icons urls visible to html template
  commonPlatforms = commonPlatforms;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private clipboard: Clipboard,
  ) {
  }

  ngOnInit(): void {
    this.refresh().catch(err => this.apiService.showErrorPopup(err));
  }

  async refresh(): Promise<void> {
    this.loading = true;
    this.profile = undefined;
    this.denialReason = undefined;

    const username: string = this.route.snapshot.params["username"] ?? "";
    const response = await this.apiService.getJSON<ProfileResponse>(
      "http://localhost:3000/profile/user_profile",
      {
        username
      }
    );
    console.log(response);
    if (response.visible) {
      this.profile = response.profile;
      this.denialReason = undefined;
      this.loading = false;
    } else {
      this.profile = undefined;
      this.denialReason = response.reason;
      this.loading = false;
    }
  }

  viewFriendProfile(friend: ProfileSummary): void {
    this.navigateToProfile(friend.username).catch(err => this.apiService.showErrorPopup(err));
  }

  private async navigateToProfile(username: string): Promise<void> {
    await this.router.navigate(['/profile', username]);
    await this.refresh();
  }

  copyMethod(method: ContactMethod): void {
    this.clipboard.copy(method.contactID);
    this.snackBar.open(
      `Copied ${this.profile!.fullName}'s ${method.platform} ID to clipboard`, "dismiss",
      { duration: 2000 });
  }
}