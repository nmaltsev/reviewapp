import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IPhotonResponse, PhotonInterface} from '../../models/photon-interface.model';
import {map} from 'rxjs/operators';

declare const API_URL = 'https://photon.komoot.de/api/';

@Injectable({
  providedIn: 'root'
})
export class PhotonService {
  constructor(
      private http: HttpClient
  ) { }

  findPlace(query, limit: number = 7): Observable<PhotonInterface[]> {
    // const tag = 'tourism';
    const params = new HttpParams()
        .set('q', query)
        // .set('osm_tag', tag)
        .set('limit', limit.toString());
    return this.http.get<IPhotonResponse>('https://photon.komoot.de/api/', {'params': params})
        .pipe(
            map((resp: IPhotonResponse) => resp.features)
        );
    
  }

}
