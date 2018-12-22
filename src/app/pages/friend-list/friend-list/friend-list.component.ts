import { Component, OnInit } from '@angular/core';
import { QueueService } from 'src/app/services/queue/queue.service';
import { Message } from 'src/app/models/message.model';
import { RdfService } from 'src/app/services/rdf.service';
import { SolidProfile } from 'src/app/models/solid-profile.model';
import { SolidSession } from 'src/app/models/solid-session.model';
import { tools } from 'src/app/utils/tools';
import { FriendListService } from 'src/app/services/friend-list/friend-list.service';
import { Subscription } from 'rxjs';
import { PopupService } from 'src/app/services/popup.service';

interface IRequest {
  messageId: string;
  profile: SolidProfile
} 

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit {
  public requestInFriends: IRequest[] = []; 
  public friendList: SolidProfile[] = [];
  public authWebId:string;
  private subscription: Subscription;

  constructor(
    private queue:QueueService,
    private rdf:RdfService,
    private frindService:FriendListService,
    private popupService: PopupService
  ) { }

  async ngOnInit() {
    let session:SolidSession = this.rdf.session || await this.rdf.getSession();
    
    if (session) {
      await this.initialize(session);
    }
    this.populateFriendList(this.frindService.friends);
    this.subscription = this.frindService.subscribeOnFriends().subscribe(async (f:string[]) => {
      this.populateFriendList(f);
    });
  }

  private async populateFriendList(friends:string[]):Promise<void>{
    this.friendList = await Promise.all(
      friends.map((webId: string) => this.rdf.collectProfileData(webId))
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private async initialize(session:SolidSession):Promise<void> {
    this.authWebId = session.webId;

    this.requestInFriends = await Promise.all(
      (await this.queue.getNewRequestsInFriends(
        session.webId
      ))
      .map(async (message: Message) => ({
        messageId: message.docId,
        profile: await this.rdf.collectProfileData(message.text)
      }))
    );
  }

  async addFriend(request:IRequest) {
    await this.frindService.addInFriends(request.profile.webId);
    await this.removeRequest(request);
  }

  removeFriend(profile:SolidProfile) {
    this.popupService.confirm(
      `Do you want cancel access rights to read your private reviews for ${profile.fn}?`, 
      async () => {
        await this.frindService.removeFriend(profile.webId);
        tools.removeItem<SolidProfile>(this.friendList, profile);
      });
  }

  async rejectRequest(request:IRequest) {
    await this.removeRequest(request);
  }

  private async removeRequest(request:IRequest): Promise<void> {
    let status:boolean = await this.queue.removeEntry(request.messageId, this.authWebId);
    
    if (status) {
      tools.removeItem<IRequest>(this.requestInFriends, request);
    }
  }

}
