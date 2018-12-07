import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-multistep-form',
  templateUrl: './multistep-form.component.html',
  styleUrls: ['./multistep-form.component.css']
})
export class MultistepFormComponent implements OnInit {
  locationModel: any;
  showFindPlace = true;

  constructor() { }

  ngOnInit() {
  }

  locationChosen(res: any) {
    this.locationModel = res;
    this.showFindPlace = false;
  }

}
