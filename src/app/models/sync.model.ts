import * as SolidAPI  from './solid-api';
import * as RDF_API from './rdf.model';

declare let $rdf: RDF_API.IRDF;
declare let solid: SolidAPI.ISolidRoot;

// Class for synchronization data on RDF Graph 
export class GraphSync {
    // Main data storage
    public g:RDF_API.IGraph;

    constructor (public url: string) {

    }
    // load data from POD
    public async load(): Promise<boolean> {
        let response: SolidAPI.IResponce;

        try {
            response = await solid.auth.fetch(this.url, { 
                method: 'GET',
                headers: { 
                'Content-Type': 'text/turtle',
                },
                credentials: 'include',
            });
        } catch(e) {
            console.warn('Can`t download from private storage');
            console.dir(e)
            return false;
        }
        
        let contentType:string = response.headers.get('Content-Type')
        let unparsedText:string = await response.text();
        this.g = $rdf.graph();

        // 'text/n3'
        let r = $rdf.parse(unparsedText, this.g, this.url, contentType);
        
        console.log('Parse result');
        console.dir(r)
        return true;
    }
    // upload updated graph in POD
    public async update(): Promise<boolean> {
        let requestBody = new $rdf.Serializer(this.g).toN3(this.g);
		
		console.log('[requestBody]');
        console.dir(requestBody);
        let response: SolidAPI.IResponce;

        try {
            response = await solid.auth.fetch(
                this.url, 
                {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'text/turtle',
                    },
                    credentials: 'include',
                    body: requestBody
                }
            );
            return true;
        } catch(e) {
            return false;
        }
    }

    public removeEntry(entryId: string): void {
        // TODO
        
        // this.g.removeMany(review.subject);

        // - delete some statements
        // kb.removeMany(me, FOAF('mbox'));
        // acl.g.removeMany($rdf.sym('https://nmaltsev.inrupt.net/#public')
    }
}