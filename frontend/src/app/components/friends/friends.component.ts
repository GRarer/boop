import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-add-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) { }

  friendRequestForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
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
          } else if (reason.status === 500) {
            message = "Internal Server Error";
          }
        }
        this.snackBar.open(message, "Dismiss", { duration: 5000 });
      });





  }

}
