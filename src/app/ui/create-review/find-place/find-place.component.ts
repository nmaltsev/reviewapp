import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PhotonService} from '../../../services/osm/photon.service';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, switchMap, tap} from 'rxjs/operators';
import {PhotonInterface} from '../../../models/photon-interface.model';


@Component({
  selector: 'app-find-place',
  templateUrl: './find-place.component.html',
  providers: [PhotonService],
  styleUrls: ['./find-place.component.css']
})
export class FindPlaceComponent implements OnInit {
  _model: PhotonInterface;
  @Input()
  get model() { return this._model; }
  set model(model) { this._model = model; }
  @Output() chosenLocation = new EventEmitter<object>();
  // model: PhotonInterface;
  searching = false;
  searchFailed = false;

  constructor(
      private _photonService: PhotonService
  ) { }

  ngOnInit() {
    // this.model = this._photonService.chosenPlace;
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
                catchError(() => {
                  this.searchFailed = true;
                  return of([]);
                })
            )
          ),
          tap(() => this.searching = false)
      )

  formatter (x: PhotonInterface) {
    let out = '';
    out += x.properties.name;
    // out += x.properties.street ? ', str. ' + x.properties.street : '';
    out += x.properties.city ? ', ' + x.properties.city : '';
    out += x.properties.state ? ', ' + x.properties.state : '';
    out += x.properties.country ? ', ' + x.properties.country : '';
    out += x.properties.osm_value ? ' (' + x.properties.osm_value + ')' : '';
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
