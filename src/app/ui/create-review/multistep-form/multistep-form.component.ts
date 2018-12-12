import {Component, OnInit} from '@angular/core';
import {PhotonInterface} from '../../../models/photon-interface.model';

@Component({
  selector: 'app-multistep-form',
  templateUrl: './multistep-form.component.html',
  styleUrls: ['./multistep-form.component.css']
})
export class MultistepFormComponent implements OnInit {
  locationModel: PhotonInterface;
  showFindPlace = true;

  constructor() { }

  ngOnInit() { }

  locationChosen(res: PhotonInterface) {
    this.locationModel = res;
    this.showFindPlace = false;
  }

  goTo(step: number) {
    switch (step) {
      case 0:
        this.showFindPlace = true;
        break;
      case 1:
        if (this.locationModel) {
          this.showFindPlace = false;
        }
        break;
      default:
        this.showFindPlace = true;
        break;
    }
  }

}
