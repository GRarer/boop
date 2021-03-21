import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, } from '@angular/common/http';
import { SessionService } from './session.service';
import { sessionTokenHeaderName } from 'boop-core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formatEndpointURL } from '../util/domains';

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
    endpointPath: string,
    queryParams?: {[param: string]: string | string[];}
  ): Promise<ResponseBodyT> {
    const options = {
      params: queryParams,
      headers: this.getAuthenticationHeader(),
    };
    return this.httpClient.get<ResponseBodyT>(formatEndpointURL(endpointPath), options).toPromise();
  }

  // like getJSON, but interprets response body as a raw string instead of parsing it as json
  async getText(
    endpointPath: string,
    queryParams?: {[param: string]: string | string[];}
  ): Promise<string> {
    const options = {
      params: queryParams,
      headers: this.getAuthenticationHeader(),
      responseType: 'text' as const
    };
    return this.httpClient.get(formatEndpointURL(endpointPath), options).toPromise();
  }

  async postJSON<RequestBodyT, ResponseBodyT>(
    endpointPath: string,
    body: RequestBodyT
  ): Promise<ResponseBodyT> {
    const options = {
      headers: this.getAuthenticationHeader(),
    };
    return this.httpClient.post<ResponseBodyT>(formatEndpointURL(endpointPath), body, options).toPromise();
  }

  async putJSON<RequestBodyT, ResponseBodyT>(
    endpointPath: string,
    body: RequestBodyT
  ): Promise<ResponseBodyT> {
    const options = {
      headers: this.getAuthenticationHeader(),
    };
    return this.httpClient.put<ResponseBodyT>(formatEndpointURL(endpointPath), body, options).toPromise();
  }

  async deleteJSON<ResponseBodyT>(
    endpointPath: string,
    queryParams?: {[param: string]: string | string[];}
  ): Promise<ResponseBodyT> {
    const options = {
      params: queryParams,
      headers: this.getAuthenticationHeader(),
    };
    return this.httpClient.delete<ResponseBodyT>(formatEndpointURL(endpointPath), options).toPromise();
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
    if (typeof err === "string") {
      return err;
    }
    if (typeof err === "object" && (typeof (err as any)["errorMessage"] === "string")) {
      return (err as any)["errorMessage"];
    }
    if (err instanceof HttpErrorResponse) {
      return this.getErrorDescription(err.error);
    }
    return "Something went wrong.";
  }

  private getAuthenticationHeader(): HttpHeaders | undefined {
    const sessionToken = this.sessionService.getSessionToken();
    if (sessionToken === undefined) {
      return undefined;
    }
    return new HttpHeaders({ [sessionTokenHeaderName]: sessionToken });
  }
}
