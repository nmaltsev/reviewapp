import { Component, OnInit } from '@angular/core';
import { QueueService } from 'src/app/services/queue/queue.service';
import { Message } from 'src/app/models/message.model';
import { RdfService } from 'src/app/services/rdf.service';
import { SolidProfile } from 'src/app/models/solid-profile.model';
import { SolidSession } from 'src/app/models/solid-session.model';
import { tools } from 'src/app/utils/tools';

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

  constructor(
    private queue:QueueService,
    private rdf:RdfService
  ) { }

  async ngOnInit() {
    let session:SolidSession = this.rdf.session || await this.rdf.getSession();
    
    if (session) {
      await this.initialize(session);
    }
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

    this.friendList = await Promise.all(
      (await this.queue.getNewRequestsInFriends(
        session.webId
      ))
      .map((message: Message) => this.rdf.collectProfileData(message.text))
    );
  }

  async test() {
    console.log('Test');
    let r = await this.queue.sendRequestAddInFriends(
      'https://amadeus.inrupt.net/profile/card#me',
      'https://myosotis.inrupt.net/profile/card#me'
    );
    console.log('Requests');
    console.dir(r);
    if (!r) {
      alert('Sorry, but that user does not use our application. Please inform him about that opportunity.');
    }
  }

  async addFriend(request:IRequest) {
    console.log('[CALL addFriend]');
    console.dir(request);
    await this.removeRequest(request);
    // TODO add in friendList
  }

  async removeFriend(profile:SolidProfile) {
    console.log('[CALL removeFriend]');
    console.dir(profile);
    // TODO remove in friendList
  }

  async rejectRequest(request:IRequest) {
    console.log('[CALL rejectRequest]');
    console.dir(request);
    await this.removeRequest(request);
  }

  private async removeRequest(request:IRequest): Promise<void> {
    let status:boolean = await this.queue.removeEntry(request.messageId, this.authWebId);
    console.log('Success: %s', status);
    
    if (status) {
      tools.removeItem<IRequest>(this.requestInFriends, request);
    }
  }

}
