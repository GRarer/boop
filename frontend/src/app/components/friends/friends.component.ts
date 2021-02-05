import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnswerFriendRequest, GetFriendsResult, ProfileSummary } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-add-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {

  info: GetFriendsResult | undefined;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) { }

  friendRequestForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
  });

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

  sendFriendRequest(): void {
    console.log(this.friendRequestForm.value);
    const friendUsername: unknown = this.friendRequestForm.value.username;
    if (typeof friendUsername !== "string" || friendUsername === "") {
      return;
    }
    this.friendRequestForm.reset();
    this.apiService.postJSON<string, void>("http://localhost:3000/friends/send_request", friendUsername)
      .then(() => {
        this.snackBar.open(`Sent friend request to '${friendUsername}'.`, "Dismiss", { "duration": 5000 });
      })
      .catch((err) => {
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

  unfriend(friendUUID: string): void {
    this.apiService.postJSON<string, void>(
      "http://localhost:3000/friends/unfriend",
      friendUUID
    ).then(() => {
      this.loadInfo();
    })
      .catch((err) => {
        this.apiService.showErrorPopup(err);
      });
  }


}
