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

  private getAuthenticationHeader(): HttpHeaders | undefined {
    const sessionToken = this.sessionService.getSessionToken();
    if (sessionToken === undefined) {
      return undefined;
    }
    return new HttpHeaders({ [sessionTokenHeaderName]: sessionToken });
  }
}
