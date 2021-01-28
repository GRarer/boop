import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateAccountRequest, isLoginResponse, LoginRequest, LoginResponse } from 'boop-core';

const sessionLSKey = "boop-session"; // key for storing sessions in local storage

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private currentSession: LoginResponse | undefined;

  constructor(
    private httpClient: HttpClient,
  ) {
    // load existing session if one is saved
    // TODO check with backend to make sure that session has not expired
    this.currentSession = this.retrieveSession();
  }

  async login(credentials: LoginRequest): Promise<void> {
    // TODO parameterize backend domain instead of specifying localhost
    this.currentSession = (await this.httpClient.post<LoginResponse>(
      "http://localhost:3000/account/login", credentials
    ).toPromise());
    this.saveSession(this.currentSession);
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

  async logout(): Promise<void> {
    // TODO send something to the backend to tell it to remove this session
    this.currentSession = undefined;
    localStorage.removeItem(sessionLSKey);
  }

  private saveSession(session: LoginResponse): void {
    localStorage.setItem(sessionLSKey, JSON.stringify(session));
  }

  private retrieveSession(): LoginResponse | undefined {
    const saved = localStorage.getItem(sessionLSKey);
    if (saved !== null) {
      try {
        const session: unknown = JSON.parse(saved);
        if (isLoginResponse(session)) {
          return session;
        }
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}
