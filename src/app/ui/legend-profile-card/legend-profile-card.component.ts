import { Component, OnInit, Input } from '@angular/core';
import { SolidProfile } from '../../models/solid-profile.model';
import {RdfService} from '../../services/rdf.service';
import { SolidSession } from 'src/app/models/solid-session.model';
import { QueueService } from 'src/app/services/queue/queue.service';
import { FriendListService } from 'src/app/services/friend-list/friend-list.service';

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
    private rdfService:RdfService,
    private queue:QueueService,
    private friendList:FriendListService
  ) { }

  async ngOnInit() {
    this.rdfService.getSession().then(async (session: SolidSession) => {
      if (session) {
        this.authWebId = session.webId;
        await this.checkFollowing();
        // this.isFriend = this.friendList.isFriend(this._userProfile.webId);
        // TODO send HEAD request to this._userProfile.webId private storage file 
        // if you get 200 status code - you are a friend
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
      if (this.isFriend) {
          await this.rdfService.updateFollowingList([this._userProfile.webId], []);
      } else {
          await this.rdfService.updateFollowingList([], [this._userProfile.webId]);
      }
      this.isFollowed = !this.isFollowed;
  }

  async friendToggle() {
    console.log('[Add in friend] %s', this._userProfile.webId);

    if (this.friendList.isFriend(this.authWebId)) {
      // TODO send message 'removeFromFriends'.
      // Also create list from whome Authorized user whant to get private reviews. (in friends.ttl)
    } else {
      let r: boolean = await this.queue.sendRequestAddInFriends(
        this._userProfile.webId, 
        this.authWebId
      );
  
      if (!r) {
        alert('Sorry, but that user does not use our application. Please inform him about that opportunity.');
      }
    }
    this.isFriend = !this.isFriend;
  }
}
