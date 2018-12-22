import { Component, OnInit, Input } from '@angular/core';
import { SolidProfile } from '../../models/solid-profile.model';
import {RdfService} from '../../services/rdf.service';
import { SolidSession } from 'src/app/models/solid-session.model';
import { QueueService } from 'src/app/services/queue/queue.service';
import { FriendListService } from 'src/app/services/friend-list/friend-list.service';
import { PrivateStorageService } from 'src/app/services/private-storage/private-storage.service';
import { ToastrService } from 'ngx-toastr';

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
    private friendList:FriendListService,
    private privateStorage:PrivateStorageService,
    private toastr: ToastrService
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

      let requestStatus:number = await this.privateStorage.isUserGrantedMeAccess(this._userProfile.webId);
      // if you get 200 status code - you are a friend
      this.isFriend = requestStatus > 199 && requestStatus < 300;
    } else {
      this.isFollowed = false;
    }
  }

  async followToggle() {
      if (!this.isFollowed) {
          await this.rdfService.updateFollowingList([this._userProfile.webId], []);
      } else {
          await this.rdfService.updateFollowingList([], [this._userProfile.webId]);
      }
      this.isFollowed = !this.isFollowed;
  }

  async friendToggle() {
    if (!this.friendList.isMyFriend(this.authWebId)) {
      let r: boolean = await this.queue.sendRequestAddInFriends(
        this._userProfile.webId, 
        this.authWebId
      );
  
      if (!r) {
        this.toastr.error(`Sorry, but ${this._userProfile.fn} does not use our application. Please inform him about that opportunity.`, 'Can not send a request');
      } else {
        this.toastr.success(`${this._userProfile.fn} will receive your request to grant you an access to the private reviews`, 'Request is sended');
      }
    } 
    // else authorized user ask viewed user to remove him from his friendList 
    this.isFriend = !this.isFriend;
  }
}
