import { Component, OnInit } from '@angular/core';
import {SolidProfile} from '../../../models/solid-profile.model';
import {RdfService} from '../../../services/rdf.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-following-list',
  templateUrl: './following-list.component.html',
  styleUrls: ['./following-list.component.css']
})
export class FollowingListComponent implements OnInit {
  private USERTIMELINE:string = '/usertimeline';
  authFollowingIds: string[];
  sugestedList: SolidProfile[];
  followingList: SolidProfile[];
  authUser: SolidProfile;
  isBad = false;
  findForm = new FormGroup({
    webId: new FormControl()
  });
  q: string;
  constructor(
    private rdfService: RdfService, 
    private router: Router
  ) { }

  ngOnInit() {
    this.getProfiles();
  }

  async getProfiles() {
    this.followingList = [];
    this.authUser = await this.rdfService.getProfile();
    this.authFollowingIds = await this.rdfService.getFriendsOf(this.authUser.webId);
    for (let i = 0; i < this.authFollowingIds.length; i++) {
      const profile =  await this.rdfService.collectProfileData(this.authFollowingIds[i]);
      if (profile) {
        this.followingList.push(profile);
      }
    }
    this.suggFriends();
  }

  async suggFriends(limit = 5) {
    this.sugestedList = [];
    // get friends of friends that are not my friends
    for (let i = 0; i < this.authFollowingIds.length; i++) {
      const fof = await this.rdfService.getFriendsOf(this.authFollowingIds[i]);
      for (let j = 0; j < fof.length; j++) {
        if (
            this.authFollowingIds.indexOf(fof[j]) === -1 &&
            fof[j] !== this.authUser.webId &&
            !this.sugestedList.find(r => r.webId === fof[j])
        ) {
          const profile: SolidProfile = await this.rdfService.collectProfileData(fof[j]);
          
          if (profile) {
            this.sugestedList.push(profile);
          }
        }
        if (limit === this.sugestedList.length) { break; }
      }
      if (limit === this.sugestedList.length) { break; }
    }
  }

  async findFriend() {
    this.q = this.findForm.getRawValue().webId;
    try {
      const prof = await this.rdfService.collectProfileData(this.q);
      this.isBad = false;
      this.router.navigateByUrl(this.USERTIMELINE + '?webId=' + encodeURIComponent(this.q));
    } catch (e) {
      this.isBad = true;
    }

  }
}
