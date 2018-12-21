import { Component, OnInit, Input } from '@angular/core';
import { SolidProfile } from 'src/app/models/solid-profile.model';

@Component({
  selector: 'app-profile-item',
  templateUrl: './profile-item.component.html',
  styleUrls: ['./profile-item.component.sass']
})
export class ProfileItemComponent implements OnInit {
  @Input() set profile(profile: SolidProfile) {
    this._profile = profile;
  }
  public _profile: SolidProfile;

  constructor() { }

  ngOnInit() {
  }

}
