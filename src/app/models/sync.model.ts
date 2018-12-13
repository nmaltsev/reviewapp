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
    public async load(): Promise<RDF_API.IGraph> {
        return solid.auth.fetch(this.url, { 
            method: 'GET',
            headers: { 
            'Content-Type': 'text/turtle',
            },
            credentials: 'include',
        }).then(async (response: SolidAPI.IResponce) => {
            let contentType:string = response.headers.get('Content-Type')
            let unparsedText:string = await response.text();
            this.g = $rdf.graph();

            // Possible content type is 'text/n3'
            let r = $rdf.parse(unparsedText, this.g, this.url, contentType);
            
            console.log('Parse result');
            console.dir(r)
            return this.g;
        });
    }

    // upload updated graph in POD
    public async update(): Promise<boolean> {
        const requestBody: string = (<RDF_API.ISerialize>new $rdf.Serializer(this.g)).toN3(this.g);
		
        try {
            await solid.auth.fetch(
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

    private recursiveRemove(t: RDF_API.ITerm) {
        let results: RDF_API.IState[] = this.g.statementsMatching(t);

        let i: number = results.length;

        while (i-- > 0) {
            if (results[i].object.termType == 'BlankNode') {
                this.recursiveRemove(results[i].object);
            }
        }
        this.g.removeMany(t);
    }
    // Return number of removed triples
    public removeEntry(entryId: string): number {
        let initSize:number = this.g.statements.length;
        
        this.recursiveRemove($rdf.sym(this.url + '#' + entryId));
        
        return initSize - this.g.statements.length;
    }
}