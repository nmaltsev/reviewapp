import { Component, OnInit, Input } from '@angular/core';
import { SolidProfile } from '../../models/solid-profile.model';
import {RdfService} from '../../services/rdf.service';

@Component({
  selector: 'legend-profile-card',
  templateUrl: './legend-profile-card.component.html',
  styleUrls: ['./legend-profile-card.component.css']
})
export class LegendProfileCardComponent implements OnInit {
  isFriend: boolean;
  private _userProfile: SolidProfile;
  get userProfile(): SolidProfile {
    return this._userProfile;
  }
  @Input()
  set userProfile(userProfile: SolidProfile) {
      this._userProfile = userProfile;
      if (userProfile && userProfile.webId !== this.authUser.webId) {
          this.checkFriendship();
      } else {
        this.isFriend = false;
      }
  }
  authUser: SolidProfile;
  constructor(private rdfService: RdfService) { }

  async ngOnInit() {
    this.authUser = await this.rdfService.getProfile();
  }

  async checkFriendship() {
      const friends = await this.rdfService.getFriendsOf(this.authUser.webId);
      this.isFriend = friends.indexOf(this._userProfile.webId) !== -1;
  }

  followToggle() {
    // TODO add/remove friends
      this.isFriend = !this.isFriend;
    console.log('Not Working Yet');
  }
}
