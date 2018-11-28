import { Component, OnInit, Input } from '@angular/core';
import { SolidProfile } from '../../models/solid-profile.model';

@Component({
  selector: 'legend-profile-card',
  templateUrl: './legend-profile-card.component.html',
  styleUrls: ['./legend-profile-card.component.css']
})
export class LegendProfileCardComponent implements OnInit {
  @Input() userProfile: SolidProfile; 
  constructor() { }

  ngOnInit() {
  }

}
