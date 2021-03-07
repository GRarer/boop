import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Profile, ProfileResponse } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  loading: boolean = true;
  denialReason: string | undefined; // reason why page is not visible
  profile?: Profile; // info to display if page is visible


  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
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
}
