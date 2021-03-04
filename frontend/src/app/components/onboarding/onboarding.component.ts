import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styles: [
  ]
})
export class OnboardingComponent implements OnInit {

  step: number = 1;
  readonly finalStep = 4;
  sentFriendRequest: boolean = false;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {}

  nextStep(): void {
    if (this.step === this.finalStep) {
      void this.router.navigate(["/home"]);
    } else {
      this.step = this.step + 1;
    }
  }

}
