import { Injectable } from '@angular/core';
import { ISolidRoot } from '../../models/solid-api';
import * as RDF_API from '../../models/rdf.model';
import { GraphSync } from 'src/app/models/sync.model';
import { Subject, Observable } from 'rxjs';
import { BaseStorageService } from '../BaseStorageService';

declare let solid: ISolidRoot;
declare let $rdf: RDF_API.IRDF;

const VCARD:RDF_API.Namespace = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');
const WAC:RDF_API.Namespace = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
const RDF:RDF_API.Namespace = $rdf.Namespace("http:/www.w3.org/1999/02/22-rdf-syntax-ns#");

@Injectable({
  providedIn: 'root'
})
export class FriendListService extends BaseStorageService  {
  protected fname:string = 'friends.ttl';

  private url:string;
  private friendSym:RDF_API.ITerm;
  private sync:GraphSync;

  private friendSubject = new Subject<string[]>();
  public friends:string[] = [];

  constructor() {super(); }

  public async init(webId: string) {
    this.url = this.getUrl(webId);
    this.friendSym = $rdf.sym(this.url + '#friends');
    this.sync = new GraphSync(this.url);

    await this.reloadFriendList();    
  }

  subscribeOnFriends(): Observable<string[]> {
    return this.friendSubject.asObservable();
  }

  public async reloadFriendList() {
    this.sync
      .load()
      .then((g:RDF_API.IGraph) => {
        if (g) {
          this.friends = this.parseFriendList(g);
          this.friendSubject.next(this.friends);
        } else {
          const g:RDF_API.IGraph = $rdf.graph();

          g.add($rdf.sym(this.url), RDF('type'), WAC('GroupListing'));
          g.add(this.friendSym, RDF('type'), VCARD('Group'));

          return solid.auth.fetch(
            this.url, 
            {
              method: 'PUT',
              headers: { 
                'Content-Type': 'text/turtle',
              },
              credentials: 'include',
              body: new $rdf.Serializer(g).toN3(g)
            }
          ).then(() => {
            this.friends = [];
            this.friendSubject.next(this.friends);
          }).catch(() => {
            console.warn(`Can't create ${this.url}`); 
            this.friends = [];
            this.friendSubject.next(this.friends);
          });
        }
      });
  }


  private parseFriendList(g:RDF_API.IGraph):string[] {
    let states:RDF_API.IState[] = g.statementsMatching(null, VCARD('hasMember'));

    return states.map((state:RDF_API.IState) => state.object.value);
  } 

  public async addInFriends(webId:string) {
    this.sync.g.add(this.friendSym, VCARD('hasMember'), $rdf.sym(webId));

    await this.sync.update();
    this.friends = this.parseFriendList(this.sync.g);
    this.friendSubject.next(this.friends);
  }

  public async removeFriend(webId:string) {
    this.sync.g.removeMatches(null, VCARD('hasMember'), $rdf.sym(webId))
    await this.sync.update();
    this.friends = this.parseFriendList(this.sync.g);
    this.friendSubject.next(this.friends);
  }

  public isMyFriend(webId:string): boolean {
    return this.friends.indexOf(webId) != -1;
  }
}
