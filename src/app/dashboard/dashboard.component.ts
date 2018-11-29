import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Services
import { AuthService } from '../services/solid.auth.service';
import { RdfService } from '../services/rdf.service';
import { SolidSession } from '../models/solid-session.model';
import {SolidProfile} from '../models/solid-profile.model';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private profileLinks: string[];
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
      this.profileLinks = profileLinks.map(encodeURIComponent);

      this.loadProfile();
    } else {
      this.profileLinks = [];
    }
  }

    async loadProfile() {
      this.route.queryParams.subscribe(async params => {
          this.paramWebId = params.webId ? decodeURIComponent(params.webId) : null;
          this.userProfile = this.paramWebId ? await this.rdfService.collectProfileData(this.paramWebId)
              : this.userProfile = await this.rdfService.collectProfileData(this.authId);
      });
  }

  onSignOut = () => {
    this.auth.solidSignOut();
  }

}
