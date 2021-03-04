import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CurrentSettingsResponse } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-avatar-onboarding',
  templateUrl: './avatar-onboarding.component.html',
  styleUrls: []
})
export class AvatarOnboardingComponent implements OnInit {

  info: CurrentSettingsResponse | undefined;

  @Output() done = new EventEmitter<void>();

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.info = undefined;
    this.apiService.getJSON<CurrentSettingsResponse>("http://localhost:3000/account/current_settings", undefined)
      .then((response) => {
        this.info = response;
      })
      .catch(err => this.apiService.showErrorPopup(err));
  }

}
