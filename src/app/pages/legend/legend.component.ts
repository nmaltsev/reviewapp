import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";
import { Subscription} from 'rxjs';
import { RdfService } from '../../services/rdf.service';
import { SolidProfile } from '../../models/solid-profile.model';
import { ReviewService } from 'src/app/services/review.service';
import { Review } from 'src/app/models/review.model';


@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  private sub: Subscription;
  private webId: string;
  private authorizedWebId: string;
  private profileData: SolidProfile;

  constructor(
    private route: ActivatedRoute,
    private rdfService: RdfService,
    private reviewService: ReviewService,
  ) {
    this.authorizedWebId = this.rdfService.session ? this.rdfService.session.webId : '';
  }

  private reviews: Review[] = [];

  ngOnInit() {
    // TODO in parallel!
    // this.rdfService.getSession()

    // Extract WebId from url query http://localhost:4200/usertimeline?webId=https%3A%2F%2Fnmaltsev.inrupt.net%2Fprofile%2Fcard%23me
    this.sub = this.route
      .queryParams
      .subscribe(async (params: Params) => {
        this.webId = decodeURIComponent(params['webId']) || this.authorizedWebId;
        console.log('[INIT legend page] WebId: %s, this.authorizedWebId: %s', this.webId, this.authorizedWebId);

        this.profileData = await this.rdfService.collectProfileData(this.webId);

        console.log('profileData');
        console.dir(this.profileData);
        this.reviews = this.reviewService.getReviews(this.profileData);
        
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
