import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateAccountRequest, LoginRequest, LoginResponse } from 'boop-core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private currentSession: LoginResponse | undefined;

  constructor(
    private httpClient: HttpClient
  ) { }

  async login(credentials: LoginRequest): Promise<void> {
    // TODO parameterize backend domain instead of specifying localhost
    this.currentSession = (await this.httpClient.post<LoginResponse>(
      "http://localhost:3000/account/login", credentials
    ).toPromise());
  }

  async loginNewAccount(request: CreateAccountRequest): Promise<void> {
    this.currentSession = (await this.httpClient.post<LoginResponse>(
      "http://localhost:3000/account/register", request
    ).toPromise());
  }

  getSessionToken(): string | undefined {
    return this.currentSession?.sessionToken;
  }
  getUserAccountUUID(): string | undefined {
    return this.currentSession?.userUUID;
  }

  logout(): void {
    // TODO send something to the backend to tell it to remote this session
    this.currentSession = undefined;
  }
}
