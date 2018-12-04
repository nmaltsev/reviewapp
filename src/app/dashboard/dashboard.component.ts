import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
// Services
import { AuthService } from '../services/solid.auth.service';
import { RdfService } from '../services/rdf.service';
import { SolidSession } from '../models/solid-session.model';
import {SolidProfile} from '../models/solid-profile.model';
import { ReviewService } from '../services/review.service';
import { Review } from '../models/review.model';
import { tools } from '../utils/tools';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  profileLinks: string[];
  queryParam: string = '';
  userProfile: SolidProfile;
  paramWebId: string;
  authId: string;
  reviewsAreLoading:boolean = false;
  reviews: Review[] = [];
  filterQuery:string = '';

  private recommendedList: string[] = [
    'https://ruben.verborgh.org/profile/#me',
    'https://www.w3.org/People/Berners-Lee/card#i',
    'https://nmaltsev.inrupt.net/profile/card#me'
  ];

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private rdfService: RdfService,
    private reviewService:ReviewService
  ) {}

  async ngOnInit() {
    const session: SolidSession = await this.rdfService.getSession();

    if (session) {
      this.authId = session.webId;
      let profileLinks: string[] = tools.joinLeft(
        await this.rdfService.getFriendsOf(session.webId),
        this.recommendedList
      );

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

  onSignOut = () => {
    this.auth.solidSignOut();
  }

  private async loadReviews(profiles: string[]):Promise<Review[]> {
    return Promise
      .all(profiles.map((webId: string) => this.reviewService.getReviews(webId)))
      .then((rewiews: Review[][]) => {
        return tools.flatten(rewiews).sort(
          (a: Review, b: Review) => a.creationDate > b.creationDate ? -1 : a.creationDate < b.creationDate ? 1 : 0
        );
      });
  }

  onquerychange(query: string): void {
    this.filterQuery = query;
  }

}
