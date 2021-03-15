import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-friend-request',
  templateUrl: './friend-request.component.html',
  styles: [
  ]
})
export class FriendRequestComponent implements OnInit {

  friendRequestForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
  });

  @Output() sentRequest = new EventEmitter<void>();

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
  }


  sendFriendRequest(): void {
    const friendUsername: unknown = this.friendRequestForm.value.username;
    if (typeof friendUsername !== "string" || friendUsername === "") {
      return;
    }
    this.friendRequestForm.reset();
    this.apiService.postJSON<string, void>("friends/send_request", friendUsername)
      .then(() => {
        this.snackBar.open(`Sent friend request to '${friendUsername}'.`, "Dismiss", { "duration": 5000 });
        this.sentRequest.emit();
      })
      .catch((err) => {
        this.apiService.showErrorPopup(err);
      });
  }

}
