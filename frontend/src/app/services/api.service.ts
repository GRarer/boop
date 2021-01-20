import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { Observable, } from 'rxjs';
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
  getJSON<ResponseT>(endPointUrl: string, queryParams?: {[param: string]: string | string[];}): Observable<ResponseT> {
    const options = {
      params: queryParams,
      headers: this.getAuthenticationHeader(),
    };
    return this.httpClient.get<ResponseT>(endPointUrl, options);
  }

  postJSON<RequestBodyT, ResponseBodyT>(
    endPointUrl: string,
    body: RequestBodyT
  ): Observable<ResponseBodyT> {
    const options = {
      headers: this.getAuthenticationHeader(),
    };
    return this.httpClient.post<ResponseBodyT>(endPointUrl, body, options);
  }

  // TODO PUT method
  // TODO DELETE method
}
