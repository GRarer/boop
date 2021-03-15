import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, } from '@angular/common/http';
import { SessionService } from './session.service';
import { isBoopError, sessionTokenHeaderName } from 'boop-core';
import { MatSnackBar } from '@angular/material/snack-bar';

// class that handles http requests to the back end to support a REST API
// automatically includes the current session token in a header, so do not use this to make requests to a 3rd party
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
  ) { }

  async getJSON<ResponseBodyT>(
    endPointUrl: string,
    queryParams?: {[param: string]: string | string[];}
  ): Promise<ResponseBodyT> {
    const options = {
      params: queryParams,
      headers: this.getAuthenticationHeader(),
    };
    return this.httpClient.get<ResponseBodyT>(endPointUrl, options).toPromise();
  }

  // like getJSON, but interprets response body as a raw string instead of parsing it as json
  async getText(
    endPointUrl: string,
    queryParams?: {[param: string]: string | string[];}
  ): Promise<string> {
    const options = {
      params: queryParams,
      headers: this.getAuthenticationHeader(),
      responseType: 'text' as const
    };
    return this.httpClient.get(endPointUrl, options).toPromise();
  }

  async postJSON<RequestBodyT, ResponseBodyT>(
    endPointUrl: string,
    body: RequestBodyT
  ): Promise<ResponseBodyT> {
    const options = {
      headers: this.getAuthenticationHeader(),
    };
    return this.httpClient.post<ResponseBodyT>(endPointUrl, body, options).toPromise();
  }

  async putJSON<RequestBodyT, ResponseBodyT>(
    endPointUrl: string,
    body: RequestBodyT
  ): Promise<ResponseBodyT> {
    const options = {
      headers: this.getAuthenticationHeader(),
    };
    return this.httpClient.put<ResponseBodyT>(endPointUrl, body, options).toPromise();
  }

  async deleteJSON<ResponseBodyT>(
    endPointUrl: string,
    queryParams?: {[param: string]: string | string[];}
  ): Promise<ResponseBodyT> {
    const options = {
      params: queryParams,
      headers: this.getAuthenticationHeader(),
    };
    return this.httpClient.delete<ResponseBodyT>(endPointUrl, options).toPromise();
  }

  // shows a snackbar message for an error thrown by the backend
  showErrorPopup(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      console.error(err.error);
    } else {
      console.error(err);
    }
    this.snackBar.open(this.getErrorDescription(err), "Dismiss", { duration: 5000 });
  }

  private getErrorDescription(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) {
      return "Something went wrong.";
    }
    const error: unknown = err.error;
    if (!isBoopError(error)) {
      return "Something went wrong.";
    }
    return error.errorMessage;
  }

  private getAuthenticationHeader(): HttpHeaders | undefined {
    const sessionToken = this.sessionService.getSessionToken();
    if (sessionToken === undefined) {
      return undefined;
    }
    return new HttpHeaders({ [sessionTokenHeaderName]: sessionToken });
  }
}
