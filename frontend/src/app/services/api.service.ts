import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { SessionService } from './session.service';
import { sessionTokenHeaderName } from 'boop-core';

// class that handles http requests to the back end to support a REST API
// automatically includes the current session token in a header, so do not use this to make requests to a 3rd party
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient,
    private sessionService: SessionService,
  ) { }

  private getAuthenticationHeader(): HttpHeaders | undefined {
    const sessionToken = this.sessionService.getSessionToken();
    if (sessionToken === undefined) {
      return undefined;
    }
    return new HttpHeaders({ [sessionTokenHeaderName]: sessionToken });
  }

  // generic method for making http get requests
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

  // TODO PUT method
  // TODO DELETE method
}
