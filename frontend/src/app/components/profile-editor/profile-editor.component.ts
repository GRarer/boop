import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProfileEditResponse, UpdateProfileTextRequest } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.scss']
})
export class ProfileEditorComponent implements OnInit {

  info?: ProfileEditResponse;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.apiService.getJSON<ProfileEditResponse>("profile/my_profile_text")
      .then(info => { this.info = info; })
      .catch(err => this.apiService.showErrorPopup(err));
  }

  removeStatus(): void {
    this.info!.statusMessage = "";
    this.apiService.putJSON<string, void>("user_info/update_status", "")
      .then(() => {
        this.snackBar.open("Status cleared", "Dismiss", { duration: 2500 });
      })
      .catch(err => {
        this.apiService.showErrorPopup(err);
      });
  }

  update(): void {
    this.apiService.putJSON<UpdateProfileTextRequest, void>(
      "profile/my_profile_text",
      { bio: this.info!.bio, statusMessage: this.info!.statusMessage }
    )
      .then(() => { this.snackBar.open("Profile Updated", "Dismiss", { duration: 2500 }); })
      .catch(err => { this.apiService.showErrorPopup(err); });
  }

  showProfile(): void {
    void this.router.navigate(['/profile', this.info!.username]);
  }

}
