import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
// Services
import { AuthService } from '../services/solid.auth.service';
import { RdfService } from '../services/rdf.service';
import { SolidSession } from '../models/solid-session.model';
import {SolidProfile} from '../models/solid-profile.model';
import { ReviewService } from '../services/review.service';
import { Review } from '../models/sdm/review.model';
import { tools } from '../utils/tools';
import { IHttpError } from '../models/exception.model';
import { IResponce } from '../models/solid-api';
import {PhotonService} from '../services/osm/photon.service';
import { PhotonInterface } from '../models/photon-interface.model';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  profileLinks: string[];
  queryParam = '';
  photonResults:PhotonInterface[] = [];
  userProfile: SolidProfile;
  paramWebId: string;
  authId: string;
  reviewsAreLoading = false;
  reviews: Review[] = [];
  filterQuery = '';

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private rdfService: RdfService,
    private reviewService: ReviewService,
    private photonService: PhotonService
  ) {}

  async ngOnInit() {
    const session: SolidSession = await this.rdfService.getSession();

    if (session) {
      this.authId = session.webId;
      const profileLinks: string[] = [session.webId].concat(await this.rdfService.getFriendsOf(session.webId));

      this.profileLinks = profileLinks.map(encodeURIComponent);
      this.handleOfParams();
      this.reviewsAreLoading = true;
      this.reviews = await this.loadReviews(profileLinks);
      this.reviewsAreLoading = false;
    } else {
      this.profileLinks = [];
    }
  }

  private handleOfParams() {
      this.route.queryParams.subscribe(async (params: Params) => {
          this.paramWebId = params.webId ? decodeURIComponent(params.webId) : null;
          this.userProfile = await this.rdfService.collectProfileData(this.paramWebId ? this.paramWebId : this.authId);
          this.queryParam = params.query ? decodeURIComponent(params.query) : '';
      });
  }

  private async loadReviews(profiles: string[]): Promise<Review[]> {
    return Promise
      .all(profiles.map((webId: string) => this.reviewService.getReviews(webId).catch((e: IHttpError<IResponce>) => {
        return null;
      })))
      .then((reviews: Review[][]) => {
        return tools.flatten(reviews).sort(
          (a: Review, b: Review) => a.creationDate > b.creationDate ? -1 : a.creationDate < b.creationDate ? 1 : 0
        );
      });
  }

  async onQueryChange(query: string): Promise<void> {
    this.queryParam = query;
    this.photonService
      .findPlace(query, 100)
      .subscribe((photonResults: PhotonInterface[]) => this.photonResults = photonResults);
  }
}
