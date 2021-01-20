import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Observable, } from 'rxjs';

// class that handles http requests to the back end to support a REST API
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient
  ) { }

  // TODO add support for URL query parameters

  // generic method for making http get requests
  getJSON<ResponseT>(endPointUrl: string, queryParams?: {[param: string]: string | string[];}): Observable<ResponseT> {
    const options = {
      params: queryParams
    };
    return this.httpClient.get<ResponseT>(endPointUrl, options);
  }

  postJSON<RequestBodyT, ResponseBodyT>(
    endPointUrl: string,
    body: RequestBodyT
  ): Observable<ResponseBodyT> {
    return this.httpClient.post<ResponseBodyT>(endPointUrl, body);
  }

  // TODO PUT method
  // TODO DELETE method
}
