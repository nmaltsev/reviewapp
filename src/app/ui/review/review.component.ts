import { Component, OnInit, Input } from '@angular/core';
import { Review } from 'src/app/models/review.model';
import {RdfService} from '../../services/rdf.service';
import {SolidProfile} from '../../models/solid-profile.model';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  authUser: SolidProfile;
  @Input() model: Review;
  constructor( private rdfService: RdfService) { }


  async ngOnInit() {
    this.authUser = await this.rdfService.getProfile();
  }

}
