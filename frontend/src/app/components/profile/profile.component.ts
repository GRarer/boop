import { Component, OnInit, } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactMethod, Profile, ProfileResponse, ProfileSummary, ProfileViewerRelation } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';
import { commonPlatforms } from 'src/app/util/platforms';
import { Clipboard } from '@angular/cdk/clipboard';
import { Location } from '@angular/common';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  loading: boolean = true;
  denialReason: string | undefined; // reason why page is not visible
  profile?: Profile; // info to display if page is visible
  relation?: ProfileViewerRelation;
  // make platform icons urls visible to html template
  commonPlatforms = commonPlatforms;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private clipboard: Clipboard,
    private location: Location,
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
      { username }
    );
    if (response.visible) {
      // replace ISO-format birth date with just age
      if (response.profile.birthDate !== null) {
        const birthDateTime = DateTime.fromISO(response.profile.birthDate);
        response.profile.birthDate = `${Math.floor(DateTime.now().diff(birthDateTime, 'years').years)}`;
      }

      this.profile = response.profile;
      this.denialReason = undefined;
      this.relation = response.viewerRelation;
      this.loading = false;
    } else {
      this.profile = undefined;
      this.denialReason = response.reason;
      this.relation = undefined;
      this.loading = false;
    }
  }

  // send a friend request to the owner of this profile
  sendFriendRequest(): void {
    this.sendFriendRequestAsync()
      .catch((err) => {
        this.apiService.showErrorPopup(err);
      });
  }

  private async sendFriendRequestAsync(): Promise<void> {
    await this.apiService.postJSON<string, void>(
      "http://localhost:3000/friends/send_request_to_uuid",
      this.profile!.uuid
    );
    await this.refresh();
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

  // navigate to previous page, and refresh if previous page is a profile
  goBack(): void {
    const originalPath = this.location.path();
    this.location.back();
    // if we're still on this component after a short delay, refresh
    // we can't do this synchronously because it takes a small time for location.back() to have an effect
    const checkToRefresh: () => void = () => {
      const currentPath = this.location.path();
      if (currentPath === originalPath ) {
        // keep waiting in intervals of 5ms
        setTimeout(checkToRefresh, 5);
      } else if (/^\/profile\//g.test(currentPath)) {
        // refresh if we arrive on a new profile
        this.refresh().catch(err => this.apiService.showErrorPopup(err));
      }
      // if the destination is not a profile page, we don't need to refresh this component
    };
    checkToRefresh();
  }
}
