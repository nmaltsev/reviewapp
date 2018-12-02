import { Component, OnInit, Input } from '@angular/core';
import { SolidProfile } from '../../models/solid-profile.model';
import {RdfService} from '../../services/rdf.service';
import { SolidSession } from 'src/app/models/solid-session.model';

@Component({
  selector: 'legend-profile-card',
  templateUrl: './legend-profile-card.component.html',
  styleUrls: ['./legend-profile-card.component.css']
})
export class LegendProfileCardComponent implements OnInit {
  private isFriend: boolean = false;
  private _userProfile: SolidProfile;
  private authWebId: string;

  get userProfile(): SolidProfile {
    return this._userProfile;
  }
  @Input()
  set userProfile(userProfile: SolidProfile) {
      this._userProfile = userProfile;
  }

  constructor(private rdfService: RdfService) { }

  async ngOnInit() {
    this.rdfService.getSession().then(async (session: SolidSession) => {
      if (session) {
        this.authWebId = session.webId;

        if (this._userProfile && this._userProfile.webId !== session.webId) {
          const friends: string[] = await this.rdfService.getFriendsOf(session.webId);
          this.isFriend = friends.indexOf(this._userProfile.webId) !== -1;
        } else {
          this.isFriend = false;
        }
      }
    });
  }

  async followToggle() {
      this.isFriend = !this.isFriend;
      if (this.isFriend) {
          await this.rdfService.updateFollowingList([this._userProfile.webId], []);
      } else {
          await this.rdfService.updateFollowingList([], [this._userProfile.webId]);
      }
  }
}
