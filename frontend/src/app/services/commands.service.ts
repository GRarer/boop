import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

// provides "cheat code" commands in browser console that allow admin users to trigger actions on the backend
// these commands will be rejected with a code 403 if the user is not signed in as an account with admin status
@Injectable({
  providedIn: 'root'
})
export class CommandsService {

  constructor(
    private apiService: ApiService
  ) {}

  enableAdminCommands(): void {
    // attach admin commands to window object to make them available in debug console
    const commands = ({
      // example command that just verifies that the user is an admin
      testAdminStatus: () => { this.sendExampleCommand(); },
      manualPush: (username: string) => { this.manualPush(username); },
      triggerPair: (usernameA: string, usernameB: string, mutualFriendUsername?: string) => {
        this.manualPair(usernameA, usernameB, mutualFriendUsername);
      }
    });
    (window as any).admin = commands;
    console.log("Boop admin commands enabled");
  }

  private sendExampleCommand(): void {
    console.log("sending example admin command");
    this.apiService.postJSON("http://localhost:3000/admin/check", undefined)
      .then(()=>{
        console.log("Current user is admin");
      })
      .catch(reason => console.error(reason));
  }

  private manualPush(username: string): void {
    this.apiService.postJSON("http://localhost:3000/admin/push", username)
      .then(() => console.log("sent push"))
      .catch((reason) => console.error(reason));
  }

  private manualPair(usernameA: string, usernameB: string, mutualFriendUsername?: string): void {
    this.apiService.postJSON<{a: string; b: string; mutual?: string;}, void>(
      "http://localhost:3000/admin/pair",
      { a: usernameA, b: usernameB, mutual: mutualFriendUsername }
    )
      .then(() => console.log("notifications triggered"))
      .catch((reason) => console.error(reason));
  }
}
