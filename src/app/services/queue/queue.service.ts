import { Injectable } from '@angular/core';

import * as SolidAPI  from '../../models/solid-api';
import * as RDF_API from '../../models/rdf.model';
import { parseLinkHeader, ISolidEntityLinkHeader } from 'src/app/utils/header-parser';

declare let $rdf: RDF_API.IRDF;
declare let solid: SolidAPI.ISolidRoot;

const RDF:RDF_API.Namespace = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const SCHEMA:RDF_API.Namespace = $rdf.Namespace("https://schema.org/");
const WAC:RDF_API.Namespace = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
const FOAF:RDF_API.Namespace = $rdf.Namespace("http://xmlns.com/foaf/0.1/");


// Message queue
@Injectable({
  providedIn: 'root'
})
export class QueueService {
  queueFile: string = 'queue.ttl';
  appFolderPath: string = '/test16.app.review.social-app/';
  
  private sessionToken: number;
  
  constructor () {
    this.sessionToken = this.generateRandToken(3);

  }

  private generateDocumentUID(): string {
    return this.sessionToken + '-' + this.generateRandToken(2);
  }

  private generateRandToken(n: number): number {
		return ~~((1 << n *10) * Math.random());
  }

  async sendRequestAddInFriends(webId: string) {
    let host: string = $rdf.sym(webId).site().value;

    this.sendMessage(host, 'requestInFriends', webId);
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

		g.add(publicSettings, RDF("type"), WAC("Authorization"));
    g.add(publicSettings, WAC("accessTo"), $rdf.sym(fileUrl));
		// g.add(publicSettings, WAC("defaultForNew"), $rdf.sym(fileUrl));
    g.add(publicSettings, WAC('mode'), WAC('Read'));
    g.add(publicSettings, WAC('mode'), WAC('Append'));
    g.add(publicSettings, WAC('agentClass'), WAC('AuthenticatedAgent'));


    g.add(ownerSettings, RDF("type"), WAC("Authorization"));
    g.add(ownerSettings, WAC('agent'), $rdf.sym(webId));
    g.add(ownerSettings, WAC("accessTo"), $rdf.sym(fileUrl));
		// g.add(ownerSettings, WAC("defaultForNew"), $rdf.sym(fileUrl));
    g.add(ownerSettings, WAC('mode'), WAC('Read'));
    g.add(ownerSettings, WAC('mode'), WAC('Write'));
    g.add(ownerSettings, WAC('mode'), WAC('Control'));
    

    return new $rdf.Serializer(g).toN3(g);
  }

  async sendMessage(host: string, type: string, data: string|Object): Promise<void> {

    console.log('[SEND: %s]', host);
    const id: string = this.generateDocumentUID();
    const ns: RDF_API.Namespace = $rdf.Namespace(host);
    const g:RDF_API.IGraph = this.transfromDataToGraph(ns('#' + id), type, data, new Date());

    let requestBody: string = new $rdf.Serializer(g).toN3(g);

    console.log('Request body: \n%s', requestBody);
    // TODO write
    const response: SolidAPI.IResponce = await solid.auth.fetch(
			host + this.appFolderPath + this.queueFile, 
			{
				// method: 'PUT',
				method: 'PATCH',
				headers: { 
					'Content-Type': 'application/sparql-update',
				},
				credentials: 'include',
				// body: requestBody
				body: `INSERT DATA {${requestBody}}`
			}
    );
    
  }

  
  private transfromDataToGraph(idUrl: string, type: string, data:string|Object, dateSent: Date):RDF_API.IGraph  {
    const g:RDF_API.IGraph = $rdf.graph();
        
    let queueTerm: RDF_API.ITerm = $rdf.sym(idUrl);

		g.add(
			queueTerm,
			RDF('type'), 
			SCHEMA('Message')
    );
    g.add(
			queueTerm,
      SCHEMA('identifier'),
      $rdf.term(type)
    );
    g.add(
			queueTerm,
      SCHEMA('dateSent'),
      $rdf.term(dateSent.toLocaleString())
    );
    g.add(
      queueTerm,
      SCHEMA('text'),
      $rdf.term(typeof(data) != 'object' ? data: JSON.stringify(data))
    );

    return g;
  }

  getNewRequestsInFriends() {

  }

  removeEntry (id) {

  }  
  
}
