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
  private USERTIMELINE = '/usertimeline';
  followingList: SolidProfile[];
  authUser: SolidProfile;
  isBad = false;
  findForm = new FormGroup({
    webId: new FormControl()
  });
  q: string;
  constructor(private rdfService: RdfService, private router: Router) { }

  ngOnInit() {
    this.getProfiles();
  }

  async getProfiles() {
    this.followingList = [];
    this.authUser = await this.rdfService.getProfile();
    const followingIds = await this.rdfService.getFriendsOf(this.authUser.webId);
    for (let i = 0; i < followingIds.length; i++) {
      this.followingList.push(await this.rdfService.collectProfileData(followingIds[i]));
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
