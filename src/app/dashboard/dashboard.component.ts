import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
// Services
import { AuthService } from '../services/solid.auth.service';
import { RdfService } from '../services/rdf.service';
import { SolidSession } from '../models/solid-session.model';
import {SolidProfile} from '../models/solid-profile.model';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  profileLinks: string[];
  query: string = '';
  userProfile: SolidProfile;
  paramWebId: string;
  authId: string;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private rdfService: RdfService
  ) {}

  async ngOnInit() {
    const session: SolidSession = await this.rdfService.getSession();

    if (session) {
      this.authId = session.webId;
      let profileLinks: string[] = await this.rdfService.getFriendsOf(session.webId);

      profileLinks.push(this.rdfService.session.webId);
      profileLinks.push('https://ruben.verborgh.org/profile/#me');
      profileLinks.push('https://www.w3.org/People/Berners-Lee/card#i');
      profileLinks.push('https://nmaltsev.inrupt.net/profile/card#me');

      this.profileLinks = profileLinks.map(encodeURIComponent);

      this.handleOfParams();
    } else {
      this.profileLinks = [];
    }
  }

  private handleOfParams() {
      this.route.queryParams.subscribe(async (params: Params) => {
          this.paramWebId = params.webId ? decodeURIComponent(params.webId) : null;
          this.userProfile = await this.rdfService.collectProfileData(this.paramWebId ? this.paramWebId : this.authId);

          this.query = params.query ? decodeURIComponent(params.query) : '';
      });
  }

  onSignOut = () => {
    this.auth.solidSignOut();
  }

}
