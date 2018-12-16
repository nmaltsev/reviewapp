import * as RDF_API from '../models/rdf.model';
declare let $rdf: RDF_API.IRDF;

export abstract class BaseStorageService {
    // Attention: all root folders/files starts with first slash! 
    protected appFolderPath: string = '/'+'test24.app.review.social-app/';
    protected abstract fname:string;

    public getUrl(webId: string): string {
        let host:string = $rdf.sym(webId).site().value;
        return host + this.appFolderPath + this.fname;
    }
}