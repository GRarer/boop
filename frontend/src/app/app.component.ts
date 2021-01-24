import { Component } from '@angular/core';

// a minimal component that acts as the root of the page
@Component({
  selector: 'app-root',
  template: `
  <h1 class="boop-header mat-display-1">Boop</h1>
  <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  title = 'boop-web';
}
