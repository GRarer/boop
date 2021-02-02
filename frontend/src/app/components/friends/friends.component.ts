import { HttpErrorResponse } from '@angular/common/http';
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
        console.error(err);
        this.snackBar.open("Something went wrong.", "Dismiss", { duration: 5000 });
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
      .catch((reason) => {
        console.error(reason);
        let message: string = "Unknown Error";
        if (reason instanceof HttpErrorResponse) {
          if (reason.status === 401) {
            message = "Failed to authenticate.";
          } else if (reason.status === 400) {
            message = "Invalid username.";
          } else if (reason.status === 403) {
            message = "You cannot send a friend request to yourself.";
          } else if (reason.status === 404) {
            message = "User not found.";
          } else if (reason.status === 409) {
            message = "You already sent a friend request or are already friends with this user.";
          } else if (reason.status === 500) {
            message = "Internal Server Error";
          }
        }
        this.snackBar.open(message, "Dismiss", { duration: 5000 });
      });
  }

  answerFriendRequest(friend: ProfileSummary, accept: boolean): void {
    this.apiService.postJSON<AnswerFriendRequest, void>(
      "http://localhost:3000/friends/answer_request",
      { friendUUID: friend.uuid, accept }
    ).then(() => {
      this.loadInfo();
    })
      .catch(() => {
        // TODO useful error messages
        this.snackBar.open("Something went wrong.", "Dismiss", { duration: 5000 });
      });
  }

  unfriend(friendUUID: string): void {
    this.apiService.postJSON<string, void>(
      "http://localhost:3000/friends/unfriend",
      friendUUID
    ).then(() => {
      this.loadInfo();
    })
      .catch(() => {
        // TODO useful error messages
        this.snackBar.open("Something went wrong.", "Dismiss", { duration: 5000 });
      });
  }


}
