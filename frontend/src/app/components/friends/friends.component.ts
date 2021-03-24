import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AnswerFriendRequest, GetFriendsResult, ProfileSummary } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';
import { DialogService } from '../common/dialog/dialog.service';

@Component({
  selector: 'app-add-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {

  info: GetFriendsResult | undefined;

  friendRequestForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
  });

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadInfo();
  }

  loadInfo(): void {
    this.apiService.getJSON<GetFriendsResult>("friends/my_friends")
      .then(info => { this.info = info; })
      .catch(err => {
        this.apiService.showErrorPopup(err);
      });
  }

  sendFriendRequest(): void {
    const friendUsername: unknown = this.friendRequestForm.value.username;
    if (typeof friendUsername !== "string" || friendUsername === "") {
      return;
    }
    this.friendRequestForm.reset();
    this.apiService.postJSON<string, GetFriendsResult>("friends/send_request", friendUsername)
      .then((info) => {
        this.info = info;
      })
      .catch((err) => {
        this.apiService.showErrorPopup(err);
      });
  }

  answerFriendRequest(friend: ProfileSummary, accept: boolean): void {
    this.apiService.postJSON<AnswerFriendRequest, GetFriendsResult>(
      "friends/answer_request",
      { friendUUID: friend.uuid, accept }
    ).then((info) => {
      this.info = info;
    })
      .catch((err) => {
        this.apiService.showErrorPopup(err);
      });
  }

  cancelFriendRequest(friend: ProfileSummary): void {
    this.apiService.postJSON<string, GetFriendsResult>(
      "friends/cancel_request", friend.uuid
    ).then((info) => {
      this.info = info;
    })
      .catch((err) => {
        this.apiService.showErrorPopup(err);
      });
  }

  async showUnfriendDialog(friend: ProfileSummary): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: "Confirm Unfriending",
      body: `Are you sure you want to unfriend ${friend.fullName}?`,
      confirmText: "Unfriend",
      cancelText: "Cancel"
    });
    if (confirmed) {
      this.info = await this.apiService.postJSON<string, GetFriendsResult>("friends/unfriend", friend.uuid);
    }
  }

  showProfile(friend: ProfileSummary): void {
    void this.router.navigate(['/profile', friend.username]);
  }

  unfriend(friend: ProfileSummary): void {
    this.showUnfriendDialog(friend).catch(err => this.apiService.showErrorPopup(err));
  }


}
