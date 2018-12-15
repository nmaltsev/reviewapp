import { Component, OnInit, Input } from '@angular/core';
import { SolidProfile } from '../../models/solid-profile.model';
import {RdfService} from '../../services/rdf.service';
import { SolidSession } from 'src/app/models/solid-session.model';
import { QueueService } from 'src/app/services/queue/queue.service';

@Component({
  selector: 'legend-profile-card',
  templateUrl: './legend-profile-card.component.html',
  styleUrls: ['./legend-profile-card.component.css']
})
export class LegendProfileCardComponent implements OnInit {
  isFriend: boolean = false;
  isFollowed: boolean = false;
  private _userProfile: SolidProfile;
  private authWebId: string;

  get userProfile(): SolidProfile {
    return this._userProfile;
  }
  @Input()
  set userProfile(userProfile: SolidProfile) {
      console.log('Set iserProfile');
      console.dir(userProfile)
      this._userProfile = userProfile;
      this.checkFollowing();
  }

  constructor(
    private rdfService: RdfService,
    private queue: QueueService
  ) { }

  async ngOnInit() {
    this.rdfService.getSession().then(async (session: SolidSession) => {
      if (session) {
        this.authWebId = session.webId;
        await this.checkFollowing();
      }
    });
  }

  private async checkFollowing() {
    if (this._userProfile && this.authWebId && this._userProfile.webId !== this.authWebId) {
      const friends: string[] = await this.rdfService.getFriendsOf(this.authWebId);

      this.isFollowed = friends.indexOf(this._userProfile.webId) !== -1;
    } else {
      this.isFollowed = false;
    }
  }

  async followToggle() {
      this.isFriend = !this.isFriend;
      if (this.isFriend) {
          await this.rdfService.updateFollowingList([this._userProfile.webId], []);
      } else {
          await this.rdfService.updateFollowingList([], [this._userProfile.webId]);
      }
  }

  async friendToggle() {
    console.log('[Add in friend] %s', this._userProfile.webId);
    let r: boolean = await this.queue.sendRequestAddInFriends(
      this._userProfile.webId, 
      this.authWebId
    );

    if (!r) {
      alert('Sorry, but that user does not use our application. Please inform him about that opportunity.');
    }
  }
}
