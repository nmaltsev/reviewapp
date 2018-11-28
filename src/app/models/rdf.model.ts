// Definition of $rdf lib.
// TODO to develop it

export interface ITerm {
    termType: string;
    value: any;
    readonly uri: string; // just js getter
}

export interface IStore {
    any(any, string): ITerm;
    each(any, string): ITerm[];
};
export interface IFetcherProperties {
    force?: boolean; // Force loading data from POD
}
export interface IFetcher {
    //  Load data from POD
    load(webId: string, p?:IFetcherProperties): Promise<void>;
};
export interface IUpdateManager {
    update(deletions: any[], insertions: any[], cb: (response: any, success: any, message: any) => void): void;
}

export type Namespace = (string) => string;
export type FetcherConstructor = (Store, Object) => void;
export type UpdateManagerConstructor = (Store) => void;

export interface IRDF {
    sym(string): any;
    Namespace(string): Namespace;
    graph(): IStore;
    Fetcher: FetcherConstructor;
    UpdateManager: UpdateManagerConstructor;
    st(a:string, b:string, c:any, d:any): any;
    NamedNode: any;
    namedNode(string): any;
    literal(a:string, b?:any): any; 
}
