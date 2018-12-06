import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {PhotonService} from '../../../services/osm/photon.service';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';


@Component({
  selector: 'app-find-place',
  templateUrl: './find-place.component.html',
  providers: [PhotonService],
  styleUrls: ['./find-place.component.css']
})
export class FindPlaceComponent implements OnInit {
  @Output() chosenLocation = new EventEmitter<object>();
  model: any;
  searching = false;
  searchFailed = false;

  constructor(
      private _photonService: PhotonService
  ) { }

  ngOnInit() {
    this.model = this._photonService.chosenPlace;
  }

  search = (text$: Observable<string>) =>
      text$.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          tap(() => this.searching = true),
          switchMap(term =>
            this._photonService.findPlace(term).pipe(
                tap(() => {
                  this.searchFailed = false;
                }),
                map(resp => resp.features),
                catchError(() => {
                  this.searchFailed = true;
                  return of([]);
                })
            )
          ),
          tap(() => this.searching = false)
      )

  formatter = (x: {'properties': any}) => {
    let out = '';
    out += x.properties.name;
    // out += x.properties.street ? ', str. ' + x.properties.street : '';
    out += x.properties.city ? ', ' + x.properties.city : '';
    out += x.properties.state ? ', ' + x.properties.state : '';
    out += x.properties.country ? ', ' + x.properties.country : '';
    out += x.properties.type ? ' (' + x.properties.type + ')' : '';
    return out;
  }

  isPlaceChosen() {
    return this.model &&
        this.model.hasOwnProperty('properties') &&
        this.model.properties.hasOwnProperty('osm_id');
  }

  nextStep() {
    this.chosenLocation.emit(this.model);
  }

}
