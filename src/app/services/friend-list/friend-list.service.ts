import { Injectable } from '@angular/core';
import { ISolidRoot } from '../../models/solid-api';
import * as RDF_API from '../../models/rdf.model';
import { GraphSync } from 'src/app/models/sync.model';
import { Subject, Observable } from 'rxjs';
import { BaseStorageService } from '../BaseStorageService';

declare let solid: ISolidRoot;
declare let $rdf: RDF_API.IRDF;

const FOAF:RDF_API.Namespace = $rdf.Namespace("http://xmlns.com/foaf/0.1/");

@Injectable({
  providedIn: 'root'
})
export class FriendListService extends BaseStorageService  {
  protected fname:string = 'friends.ttl';
  // private appFolderPath: string = '/test23.app.review.social-app/';

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
          console.log('After load read');
          console.dir(this.friends);
          this.friendSubject.next(this.friends);
        } else {
          return solid.auth.fetch(
            this.url, 
            {
              method: 'PUT',
              headers: { 
                'Content-Type': 'text/turtle',
              },
              credentials: 'include',
              body: ''
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

  // public getUrl(webId: string): string {
  //   let host:string = $rdf.sym(webId).site().value;
  //   return host + this.appFolderPath + this.fname;
  // }

  private parseFriendList(g:RDF_API.IGraph):string[] {
    let states:RDF_API.IState[] = g.statementsMatching(null);

    return states.map((state:RDF_API.IState) => state.object.value);
  } 

  public async addInFriends(webId:string) {
    this.sync.g.add(
      this.friendSym,
      FOAF('member'),
      $rdf.sym(webId)
    );

    await this.sync.update();
    this.friends = this.parseFriendList(this.sync.g);
    this.friendSubject.next(this.friends);
  }

  public async removeFriend(webId:string) {
    this.sync.g.removeMatches(null, FOAF('member'), $rdf.sym(webId))
    await this.sync.update();
    this.friends = this.parseFriendList(this.sync.g);
    this.friendSubject.next(this.friends);
  }

  public isFriend(webId:string): boolean {
    console.log('CALL isFriend %s', webId);
    console.dir(this.friends);
    console.dir(this.friends.indexOf(webId) != -1);
    return this.friends.indexOf(webId) != -1;
  }
}
