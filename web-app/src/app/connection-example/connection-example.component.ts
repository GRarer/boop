import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-connection-example',
  templateUrl: './connection-example.component.html',
  styles: [
  ]
})
export class ConnectionExampleComponent implements OnInit {

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
  }

  testGet(): void {
    this.apiService.getJSON<string>("http://localhost:3000/example/foobar").subscribe((result) => console.log("get result", result));
  }

  testPost(): void {
    const body = {
      foo: "bar",
      baz: 42,
    };
    this.apiService.postJSON<{}, string>("http://localhost:3000/example/", body).subscribe();
  }
}
