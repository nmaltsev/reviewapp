import { Injectable } from '@angular/core';

import * as SolidAPI  from '../../models/solid-api';
import * as RDF_API from '../../models/rdf.model';
import { parseLinkHeader, ISolidEntityLinkHeader } from 'src/app/utils/header-parser';
import { tools } from '../../utils/tools';

declare let $rdf: RDF_API.IRDF;
declare let solid: SolidAPI.ISolidRoot;

const RDF:RDF_API.Namespace = $rdf.Namespace("http:/www.w3.org/1999/02/22-rdf-syntax-ns#");
const SCHEMA:RDF_API.Namespace = $rdf.Namespace("https://schema.org/");
const WAC:RDF_API.Namespace = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
const FOAF:RDF_API.Namespace = $rdf.Namespace("http://xmlns.com/foaf/0.1/");


// Message queue
@Injectable({
  providedIn: 'root'
})
export class QueueService {
  queueFile: string = 'queue.ttl';
  appFolderPath: string = '/test23.app.review.social-app/';
  
  private sessionToken: number;
  
  constructor () {
    this.sessionToken = tools.generateRandToken(3);

  }

  private generateDocumentUID(): string {
    return this.sessionToken + '-' + tools.generateRandToken(2);
  }

  async sendRequestAddInFriends(webId: string): Promise<boolean> {
    let host: string = $rdf.sym(webId).site().value;

    return await this.sendMessage(host, 'requestInFriends', webId);
  }

  public getUrl(webId: string): string {
    let host: string = $rdf.sym(webId).site().value;
    return host + this.appFolderPath + this.queueFile;
  }

  async initializeStore(webId: string) {
    let host: string = $rdf.sym(webId).site().value;

    const response: SolidAPI.IResponce = await solid.auth.fetch(
			host + this.appFolderPath + this.queueFile, 
			{
				method: 'HEAD',
				headers: { 
					'Content-Type': 'application/sparql-update',
				},
				credentials: 'include',
			}
    );

    if (response.status == 404) {
      const createResponse: SolidAPI.IResponce = await solid.auth.fetch(
        host + this.appFolderPath + this.queueFile, 
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
      let requestBody:string = this.getACLRequestBody(host, host + this.appFolderPath + this.queueFile, webId);
      // 

      console.log('ACL URL: %s', aclUrl)
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
        console.warn('Can not create a `%s`', this.queueFile);
      }
    }
  }

  private getACLRequestBody(host: string, fileUrl:string, webId: string): string {
    const ns: RDF_API.Namespace = $rdf.Namespace(host);
    const g:RDF_API.IGraph = $rdf.graph();

    const publicSettings:RDF_API.ITerm = $rdf.sym(ns('#public'));
    const ownerSettings:RDF_API.ITerm = $rdf.sym(ns('#owner'));

    g.add(ownerSettings, RDF("type"), WAC("Authorization"));
    g.add(ownerSettings, WAC('agent'), $rdf.sym(webId));
    g.add(ownerSettings, WAC("accessTo"), $rdf.sym(fileUrl));
    g.add(ownerSettings, WAC('mode'), WAC('Read'));
    g.add(ownerSettings, WAC('mode'), WAC('Write'));
    g.add(ownerSettings, WAC('mode'), WAC('Control'));

    g.add(publicSettings, RDF("type"), WAC("Authorization"));
    g.add(publicSettings, WAC('agentClass'), FOAF('Agent'));
    g.add(publicSettings, WAC("accessTo"), $rdf.sym(fileUrl));
    g.add(publicSettings, WAC('mode'), WAC('Read'));
    g.add(publicSettings, WAC('mode'), WAC('Append'));

    // TODO add in report
    // There are mistakes in documentation (https://www.w3.org/wiki/WebAccessControl#Agents_and_classes and https://github.com/solid/web-access-control-spec#public-access-all-agents):
    // g.add(publicSettings, WAC('agentClass'), FOAF('Agent')); delegate write access only for authorized users. So it is working as WAC('AuthenticatedAgent') from documentation
    // g.add(publicSettings, WAC('agentClass'), WAC('AuthenticatedAgent')); - The Inrupt solid server does not recognize that statement

    return new $rdf.Serializer(g).toN3(g);
  }

  async sendMessage(host: string, type: string, data: string|Object): Promise<boolean> {
    const id: string = this.generateDocumentUID();
    const ns: RDF_API.Namespace = $rdf.Namespace(host);
    const g:RDF_API.IGraph = this.transfromDataToGraph(ns('#' + id), type, data, new Date());

    let requestBody: string = new $rdf.Serializer(g).toN3(g);

    const response: SolidAPI.IResponce = await solid.auth.fetch(
			host + this.appFolderPath + this.queueFile, 
			{
				method: 'PATCH',
				headers: { 
					'Content-Type': 'application/sparql-update',
				},
				credentials: 'include',
				body: `INSERT DATA {${requestBody}}`
			}
    );

    return response.status > 199 && response.status < 300;
  }

  
  private transfromDataToGraph(idUrl: string, type: string, data:string|Object, dateSent: Date):RDF_API.IGraph  {
    const g:RDF_API.IGraph = $rdf.graph();
        
    let queueTerm: RDF_API.ITerm = $rdf.sym(idUrl);

		g.add(queueTerm, RDF('type'), SCHEMA('Message'));
    g.add(queueTerm, SCHEMA('identifier'), $rdf.term(type));
    g.add(queueTerm, SCHEMA('dateSent'), $rdf.term(dateSent.toLocaleString()));
    g.add(queueTerm, SCHEMA('text'), $rdf.term(typeof(data) != 'object' ? data: JSON.stringify(data)));

    return g;
  }

  // TODO all managing operation realize throught SyncModel.ts 
  // getNewRequestsInFriends() {}
  // removeEntry (id) {}  
  
}
