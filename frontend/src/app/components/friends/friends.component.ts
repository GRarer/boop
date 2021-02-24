import { Component, OnInit } from '@angular/core';
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

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.loadInfo();
  }

  loadInfo(): void {
    this.apiService.getJSON<GetFriendsResult>("http://localhost:3000/friends/my_friends")
      .then(info => { this.info = info; })
      .catch(err => {
        this.apiService.showErrorPopup(err);
      });
  }

  answerFriendRequest(friend: ProfileSummary, accept: boolean): void {
    this.apiService.postJSON<AnswerFriendRequest, void>(
      "http://localhost:3000/friends/answer_request",
      { friendUUID: friend.uuid, accept }
    ).then(() => {
      this.loadInfo();
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
      await this.apiService.postJSON<string, void>("http://localhost:3000/friends/unfriend", friend.uuid);
      this.loadInfo();
    }
  }

  unfriend(friend: ProfileSummary): void {
    this.showUnfriendDialog(friend).catch(err => this.apiService.showErrorPopup(err));
  }


}
