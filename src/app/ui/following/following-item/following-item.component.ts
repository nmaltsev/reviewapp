import {Component, Input, OnInit} from '@angular/core';
import {SolidProfile} from '../../../models/solid-profile.model';
import {RdfService} from '../../../services/rdf.service';
import {SolidSession} from '../../../models/solid-session.model';

@Component({
  selector: 'app-following-item',
  templateUrl: './following-item.component.html',
  styleUrls: ['./following-item.component.css']
})
export class FollowingItemComponent implements OnInit {
  public isFriend = false;
  private authWebId: string;
  private _profile: SolidProfile;
  @Input()
  set profile(profile: SolidProfile) {
    this._profile = profile;
  }
  get profile(): SolidProfile { return this._profile; }

  constructor(private rdfService: RdfService) { }

  async ngOnInit() {
    this.rdfService.getSession().then(async (session: SolidSession) => {
      if (session) {
        this.authWebId = session.webId;

        if (this._profile && this._profile.webId !== session.webId) {
          const friends: string[] = await this.rdfService.getFriendsOf(session.webId);
          this.isFriend = friends.indexOf(this._profile.webId) !== -1;
        } else {
          this.isFriend = false;
        }
      }
    });
  }

  async followToggle() {
    this.isFriend = !this.isFriend;
    if (this.isFriend) {
      await this.rdfService.updateFollowingList([this._profile.webId], []);
    } else {
      await this.rdfService.updateFollowingList([], [this._profile.webId]);
    }
  }

}
