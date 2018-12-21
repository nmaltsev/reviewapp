import { Injectable } from '@angular/core';
import * as SolidAPI  from '../../models/solid-api';
import * as RDF_API from '../../models/rdf.model';
import { parseLinkHeader, ISolidEntityLinkHeader } from 'src/app/utils/header-parser';
import { Review } from 'src/app/models/sdm/review.model';
import { BaseStorageService } from '../BaseStorageService';

declare let $rdf: RDF_API.IRDF;
declare let solid: SolidAPI.ISolidRoot;

const RDF:RDF_API.Namespace = $rdf.Namespace("http:/www.w3.org/1999/02/22-rdf-syntax-ns#");
const WAC:RDF_API.Namespace = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");


@Injectable({
  providedIn: 'root'
})
export class PrivateStorageService extends BaseStorageService {
  protected fname:string = 'reviews4friends.ttl';
  // Attention: all root folders/files starts with first slash! 
  // appFolderPath: string = '/' + 'test23.app.review.social-app/';

  constructor() { super();}

  async initializeStore(webId: string) {
    let host: string = $rdf.sym(webId).site().value;

    const response: SolidAPI.IResponce = await solid.auth.fetch(
			host + this.appFolderPath + this.fname, 
			{
				method: 'HEAD',
				headers: { 
					'Content-Type': 'text/turtle',
				},
				credentials: 'include',
			}
    );
    // If file not exist.
    // Error 403 will tell us that file exist, but somebody have changed access rights for us ;)
    if (response.status == 404) {
      const createResponse: SolidAPI.IResponce = await solid.auth.fetch(
        host + this.appFolderPath + this.fname, 
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'text/turtle',
          },
          credentials: 'include',
          body: ''
        }
      );
      let linkHeaders:ISolidEntityLinkHeader = parseLinkHeader(response.headers.get('Link'));

      if (!linkHeaders.acl || !linkHeaders.acl.href) {
        return;
      }
      let aclUrl:string = host + this.appFolderPath + linkHeaders.acl.href;
      let requestBody:string = this.getACLRequestBody(host, host + this.appFolderPath + this.fname, webId);

      const aclResponse: SolidAPI.IResponce = await solid.auth.fetch(
        aclUrl, 
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'text/turtle',
          },
          credentials: 'include',
          body: requestBody
        }
      );

      console.log('aclResponse');
      console.dir(aclResponse);
      if (aclResponse.status > 299 || aclResponse.status < 200) {
        console.warn('Can not create a `%s`', this.fname);
      }
    }
  }

  private getACLRequestBody(host: string, fileUrl:string, webId: string): string {
    // const ns: RDF_API.Namespace = $rdf.Namespace(host);
    const ns: RDF_API.Namespace = $rdf.Namespace(host + this.appFolderPath + this.fname);
    const g:RDF_API.IGraph = $rdf.graph();

    const publicSettings:RDF_API.ITerm = $rdf.sym(ns('#public'));
    const ownerSettings:RDF_API.ITerm = $rdf.sym(ns('#owner'));

    g.add(ownerSettings, RDF('type'), WAC("Authorization"));
    g.add(ownerSettings, WAC('agent'), $rdf.sym(webId));
    g.add(ownerSettings, WAC('accessTo'), $rdf.sym(fileUrl));
    g.add(ownerSettings, WAC('mode'), WAC('Read'));
    g.add(ownerSettings, WAC('mode'), WAC('Write'));
    g.add(ownerSettings, WAC('mode'), WAC('Control'));

    g.add(publicSettings, RDF("type"), WAC("Authorization"));
    g.add(publicSettings, WAC('agentGroup'), $rdf.sym(host + this.appFolderPath + 'friends.ttl#friends'));
    g.add(publicSettings, WAC("accessTo"), $rdf.sym(fileUrl));
    g.add(publicSettings, WAC('mode'), WAC('Read'));

    return new $rdf.Serializer(g).toN3(g);
  }

  public async addReview(review: Review):Promise<boolean> {
    let host: string = $rdf.sym(review.author.webId).site().value;
    
    const response: SolidAPI.IResponce = await solid.auth.fetch(
			host + this.appFolderPath + this.fname, 
			{
				method: 'PATCH',
				headers: { 
					'Content-Type': 'application/sparql-update',
				},
				credentials: 'include',
				body: `INSERT DATA {${review.toTTL(new Date())}}`
			}
    );

    return response.status > 199 && response.status < 300;
  } 

  public async isUserGrantedMeAccess(webId:string): Promise<number> {
    let url:string = this.getUrl(webId);

    const response: SolidAPI.IResponce = await solid.auth.fetch(
			url, 
			{
				method: 'HEAD',
				headers: { 
					'Content-Type': 'application/sparql-update',
				},
				credentials: 'include',
			}
    );
    return response.status;
  }
}
