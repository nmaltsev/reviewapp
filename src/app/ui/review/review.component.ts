import { Component, OnInit, Input } from '@angular/core';
import { Review } from 'src/app/models/sdm/review.model';
import {RdfService} from '../../services/rdf.service';
import {SolidProfile} from '../../models/solid-profile.model';
import { ReviewService } from 'src/app/services/review.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  authUser: SolidProfile;
  @Input() model: Review;
  constructor(
    private rdfService: RdfService,
    private reviewService: ReviewService
  ) { }

  async ngOnInit() {
    this.authUser = await this.rdfService.getProfile();
  }

  async remove() {
    this.reviewService.removeReview(this.model);
  }

}
