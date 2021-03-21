import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from 'boop-core';

// this service is used to transition from the landing page to the registration page
@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(
    private router: Router,
  ) { }

  private credentials?: LoginRequest;

  getCredentials(): LoginRequest | undefined {
    return this.credentials;
  }

  clearCredentials(): void {
    this.credentials = undefined;
  }

  startRegistration(credentials: LoginRequest): void {
    this.credentials = credentials;
    void this.router.navigate(["register"]);
  }
}
