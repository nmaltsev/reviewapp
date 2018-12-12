import { Injectable } from '@angular/core';
import * as SolidAPI  from '../../models/solid-api';
import * as RDF_API from '../../models/rdf.model';
import { parseLinkHeader, ISolidEntityLinkHeader } from 'src/app/utils/header-parser';
import { tools } from '../../utils/tools';
import { Review } from 'src/app/models/review.model';

declare let $rdf: RDF_API.IRDF;
declare let solid: SolidAPI.ISolidRoot;

const RDF:RDF_API.Namespace = $rdf.Namespace("http:/www.w3.org/1999/02/22-rdf-syntax-ns#");
const SCHEMA:RDF_API.Namespace = $rdf.Namespace("https://schema.org/");
const WAC:RDF_API.Namespace = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
const FOAF:RDF_API.Namespace = $rdf.Namespace("http://xmlns.com/foaf/0.1/");


@Injectable({
  providedIn: 'root'
})
export class PrivateStorageService {
  fileName: string = 'reviews4friends.ttl';
  // Attention: all root folders/files starts with first slash! 
  appFolderPath: string = '/' + 'test23.app.review.social-app/';
  private sessionToken: number;

  constructor() {
    this.sessionToken = tools.generateRandToken(3);
  }

  private generateDocumentUID(): string {
    return '#' + this.sessionToken + '-' + tools.generateRandToken(2);
  }

  async initializeStore(webId: string) {
    let host: string = $rdf.sym(webId).site().value;

    const response: SolidAPI.IResponce = await solid.auth.fetch(
			host + this.appFolderPath + this.fileName, 
			{
				method: 'HEAD',
				headers: { 
					'Content-Type': 'application/sparql-update',
				},
				credentials: 'include',
			}
    );
    // If file not exist.
    // Error 403 will tell us that file exist, but somebody have changed access rights for us ;)
    if (response.status == 404) {
      const createResponse: SolidAPI.IResponce = await solid.auth.fetch(
        host + this.appFolderPath + this.fileName, 
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
      let requestBody:string = this.getACLRequestBody(host, host + this.appFolderPath + this.fileName, webId);

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
        console.warn('Can not create a `%s`', this.fileName);
      }
    }
  }

  private getACLRequestBody(host: string, fileUrl:string, webId: string): string {
    const ns: RDF_API.Namespace = $rdf.Namespace(host);
    const g:RDF_API.IGraph = $rdf.graph();

    const publicSettings:RDF_API.ITerm = $rdf.sym(ns('#public'));
    const ownerSettings:RDF_API.ITerm = $rdf.sym(ns('#owner'));

    g.add(ownerSettings, RDF('type'), WAC("Authorization"));
    g.add(ownerSettings, WAC('agent'), $rdf.sym(webId));
    g.add(ownerSettings, WAC('accessTo'), $rdf.sym(fileUrl));
    g.add(ownerSettings, WAC('mode'), WAC('Read'));
    g.add(ownerSettings, WAC('mode'), WAC('Write'));
    g.add(ownerSettings, WAC('mode'), WAC('Control'));

    // TODO configure access right for friends group
    // g.add(publicSettings, RDF("type"), WAC("Authorization"));
    // g.add(publicSettings, WAC('agentClass'), FOAF('Agent'));
    // g.add(publicSettings, WAC("accessTo"), $rdf.sym(fileUrl));
    // g.add(publicSettings, WAC('mode'), WAC('Read'));
    // g.add(publicSettings, WAC('mode'), WAC('Append'));

    return new $rdf.Serializer(g).toN3(g);
  }

  public async addReview(review: Review):Promise<boolean> {
    let host: string = $rdf.sym(review.author.webId).site().value;
    
    const response: SolidAPI.IResponce = await solid.auth.fetch(
			host + this.appFolderPath + this.fileName, 
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


}
