import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileResponse } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styles: [
  ]
})
export class ProfileComponent implements OnInit {

  info?: ProfileResponse;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.refresh().catch(err => this.apiService.showErrorPopup(err));
  }

  async refresh(): Promise<void> {
    const username: string = this.route.snapshot.params["username"] ?? "";
    this.info = await this.apiService.getJSON<ProfileResponse>(
      "http://localhost:3000/profile/user_profile",
      {
        username
      }
    );
    console.log(this.info);
  }
}
