import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// class that handles http requests to the back end to support a REST API
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient
  ) { }

  private handleError<T>(err: T): Observable<T> {
    let message = "Error";
    let description = "";
    console.error(err);
    if (err instanceof HttpErrorResponse) {
      message = `Error ${err.status}: ${err.statusText}`;
      description = err.error;
    }
    console.warn(message, description);
    // TODO redirect to an error screen instead of using alert();
    setTimeout(() => {
      alert(`${message} : ${description}`);
    }, (10));
    return throwError(err);
  }


  private getApiHeaders(): HttpHeaders {
    return new HttpHeaders({
      "Content-Type": "application/json",
      // TODO include authentication tokens in request headers
    });
  }
  // TODO add support for URL query parameters

  // generic method for making http get requests
  getJSON<ResponseT>(endPointUrl: string): Observable<ResponseT> {
    console.log("make get request");
    return this.httpClient.get<ResponseT>(endPointUrl).pipe(
    ).pipe(catchError(
      ((err) => this.handleError(err))
    ));
  }

  postJSON<RequestBodyT, ResponseBodyT>(
    endPointUrl: string,
    body: RequestBodyT
  ): Observable<ResponseBodyT> {
    return this.httpClient.post<ResponseBodyT>(endPointUrl, body).pipe(
      catchError(((err) => this.handleError(err))),
    );
  }

  // TODO PUT method
  // TODO DELETE method
}