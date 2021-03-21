import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginRequest, LoginResponse, sessionTokenHeaderName } from 'boop-core';
import { formatEndpointURL } from '../util/domains';

const tokenLSKey = "boop-session-token"; // key for storing session tokens in local storage

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private token?: string;

  constructor(
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
  ) { }

  async login(credentials: LoginRequest): Promise<void> {
    const token = (await this.httpClient.post<LoginResponse>(
      formatEndpointURL("account/login"),
      credentials
    ).toPromise()).sessionToken;
    this.setToken(token);
  }

  setToken(token: string): void {
    this.token = token;
    this.saveToken(this.token);
  }

  // attempts to load saved session if it exists, returns false if it doesn't or it has expired.
  async loadSavedSession(): Promise<boolean> {
    // load existing session if one is saved
    const savedToken = localStorage.getItem(tokenLSKey);
    if (savedToken === null) {
      return false;
    }
    const isValidSession = await this.httpClient.get<boolean>(
      formatEndpointURL("account/sessionValid"),
      { headers: new HttpHeaders({ [sessionTokenHeaderName]: savedToken }) }
    ).toPromise();
    if (isValidSession) {
      this.token = savedToken;
      return true;
    } else {
      this.snackBar.open("Your previous session has timed out.", "Dismiss", { "duration": 5000 });
      try {
        localStorage.removeItem(tokenLSKey);
      } catch (err) {
        console.error(err);
      }
      return false;
    }
  }

  getSessionToken(): string | undefined {
    return this.token;
  }

  async logout(): Promise<void> {
    const token = this.token;
    this.token = undefined;
    localStorage.removeItem(tokenLSKey);
    if (token !== undefined) {
      // we tell the backend that it should close the session, but we don't need to await for the response
      this.httpClient.post(
        formatEndpointURL("account/logout"),
        undefined,
        { headers: new HttpHeaders({ [sessionTokenHeaderName]: token }) }
      ).toPromise()
        .catch((err) => {
          console.error("Failed to close session with backend");
          console.log(err);
        });
    }
  }

  private saveToken(token: string): void {
    try {
      localStorage.setItem(tokenLSKey, token);
    } catch (err) {
      console.error(err);
    }
  }
}
