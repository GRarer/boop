import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styles: [
  ]
})
export class OnboardingComponent implements OnInit {

  step: 1 | 2 | 3 = 1;
  sentFriendRequest: boolean = false;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {

  }

  nextStep(): void {
    switch (this.step) {
    case 1: {
      this.step = 2;
      break;
    }
    case 2: {
      this.step = 3;
      break;
    }
    case 3: {
      void this.router.navigate(["/home"]);
      break;
    }
    }
  }

}
