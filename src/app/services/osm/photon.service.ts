import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

declare const API_URL = 'http://photon.komoot.de/api/';

@Injectable({
  providedIn: 'root'
})
export class PhotonService {
  chosenPlace: any;
  constructor(
      private http: HttpClient
  ) { }

  findPlace(query, limit: number = 7): Observable<any> {
    const params = new HttpParams()
        .set('q', query)
        .set('limit', limit.toString());
    return this.http.get<any>('http://photon.komoot.de/api/', {'params': params});
  }

}
