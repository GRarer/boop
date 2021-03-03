import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserAccountResponse } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-avatar-onboarding',
  templateUrl: './avatar-onboarding.component.html',
  styleUrls: []
})
export class AvatarOnboardingComponent implements OnInit {

  info: UserAccountResponse | undefined;

  @Output() done = new EventEmitter<void>();

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.info = undefined;
    this.apiService.getJSON<UserAccountResponse>("http://localhost:3000/account/info", undefined)
      .then((response) => {
        this.info = response;
      })
      .catch(err => this.apiService.showErrorPopup(err));
  }

}
