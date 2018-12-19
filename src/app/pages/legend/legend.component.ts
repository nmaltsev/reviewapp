import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription} from 'rxjs';
import { RdfService } from '../../services/rdf.service';
import { SolidProfile } from '../../models/solid-profile.model';
import { ReviewService } from 'src/app/services/review.service';
import { Review } from 'src/app/models/sdm/review.model';
import { SolidSession } from 'src/app/models/solid-session.model';


@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  private sub: Subscription;
  private webId: string;
  private profileIsLoaded: boolean = false;
  profileData: SolidProfile;
  reviews: Review[] = [];
  reviewsAreLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private rdfService: RdfService,
    private reviewService: ReviewService,
  ) {}


  ngOnInit() {
    // Extract WebId from url query http://localhost:4200/usertimeline?webId=https%3A%2F%2Fnmaltsev.inrupt.net%2Fprofile%2Fcard%23me
    this.sub = this.route
      .queryParams
      .subscribe(async (params: Params) => {
        // Attention: decodeURIComponent(undefined) === 'undefined'
        await this.keepOn(params.hasOwnProperty('webId') && decodeURIComponent(params['webId']));
      });
    this.rdfService.getSession().then(async (session:SolidSession) => {
      if (!this.profileIsLoaded) {
        await this.keepOn(session && session.webId);
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private async keepOn(webId: string): Promise<void> {
    if (!webId) { return; }
    this.webId = webId;
    this.profileIsLoaded = true;

    this.profileData = await this.rdfService.collectProfileData(this.webId);
    this.reviewsAreLoading = true;

    try {
      this.reviews = await this.reviewService.getReviews(this.webId, true);
    } catch (e) {
      console.log('Failed to load reviews');
      console.dir(e);
    } finally {
      this.reviewsAreLoading = false;
    }

  }

}
