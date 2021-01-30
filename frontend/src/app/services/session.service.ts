import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateAccountRequest, isLoginResponse, LoginRequest, LoginResponse, sessionTokenHeaderName } from 'boop-core';

const sessionLSKey = "boop-session"; // key for storing sessions in local storage

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private currentSession: LoginResponse | undefined;

  constructor(
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
  ) { }

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
    this.saveSession(this.currentSession);
  }

  // attempts to load saved session if it exists, returns false if it doesn't or it has expired.
  async loadSavedSession(): Promise<boolean> {
    // load existing session if one is saved
    // TODO check with backend to make sure that session has not expired
    const savedSession = this.retrieveSession();
    if (savedSession === undefined) {
      return false;
    }
    const isValidSession = await this.httpClient.get<boolean>(
      "http://localhost:3000/account/sessionValid",
      { headers: new HttpHeaders({ [sessionTokenHeaderName]: savedSession.sessionToken }) }
    ).toPromise();
    if (isValidSession) {
      this.currentSession = savedSession;
      return true;
    } else {
      this.snackBar.open("Your previous session has timed out.", "Dismiss", { "duration": 5000 });
      try {
        localStorage.removeItem(sessionLSKey);
      } catch (err) {
        console.error(err);
      }
      return false;
    }
  }

  getSessionToken(): string | undefined {
    return this.currentSession?.sessionToken;
  }
  getUserAccountUUID(): string | undefined {
    return this.currentSession?.userUUID;
  }

  async logout(): Promise<void> {
    const token = this.currentSession?.sessionToken;
    this.currentSession = undefined;
    localStorage.removeItem(sessionLSKey);
    if (token !== undefined) {
      // we tell the backend that it should close the session, but we don't need to await for the response
      this.httpClient.post(
        "http://localhost:3000/account/logout",
        undefined,
        { headers: new HttpHeaders({ [sessionTokenHeaderName]: token }) }
      ).toPromise()
        .catch((err) => {
          console.error("Failed to close session with backend");
          console.log(err);
        });
    }
  }

  private saveSession(session: LoginResponse): void {
    try {
      localStorage.setItem(sessionLSKey, JSON.stringify(session));
    } catch (err) {
      console.error(err);
    }
  }

  private retrieveSession(): LoginResponse | undefined {
    try {
      const saved = localStorage.getItem(sessionLSKey);
      if (saved !== null) {
        const session: unknown = JSON.parse(saved);
        if (isLoginResponse(session)) {
          return session;
        }
      }
    } catch (err) {
      console.error(err);
    }
    return undefined;
  }
}
