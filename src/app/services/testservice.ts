import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { TestDescr } from '../core/testdescr';

@Injectable()
export class TestService {
  constructor(private http: HttpClient) {
  }
  public loadJson() {
    const RESOURCE_NAME = './assets/test.json';
    const strm = this.http.get<TestDescr>(RESOURCE_NAME);
    // console.log('VM. loadJson invoked');
    return strm;
  }
}
