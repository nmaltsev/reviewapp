// Definition of $rdf lib.
// TODO to develop it

export interface ITerm {
    termType: string;
    value: any;
    readonly uri: string; // just js getter
    doc(): ITerm;
    dir(): ITerm;
}

export interface IState {
    predicate: ITerm;
    subject: ITerm;
    object: ITerm;
}

export interface IStore {
    any(a1:ITerm, a2:string, a3?:string|ITerm, a4?:ITerm): ITerm;
    each(any, string): ITerm[];
    statementsMatching(a1?:string, a2?:string, a3?:string, a4?:string): IState[];
}

export interface IFetcherProperties {
    force?: boolean; // Force loading data from POD
}
export interface IFetcher {
    //  Load data from POD
    load(resource: string | ITerm, p?:IFetcherProperties): Promise<void>;
    store: IStore;
};
export interface IUpdateManager {
    update(deletions: any[], insertions: any[], cb: (response: any, success: any, message: any) => void): void;
}

export type Namespace = (string) => string;
export type FetcherConstructor = (Store, Object) => void;
export type UpdateManagerConstructor = (Store) => void;

export interface IRDF {
    sym(string): ITerm;
    Namespace(string): Namespace;
    graph(): IStore;
    Fetcher: FetcherConstructor;
    UpdateManager: UpdateManagerConstructor;
    st(subject:ITerm|string, predicate:ITerm|string, object:ITerm|string, why:ITerm|string): ITerm;
    NamedNode: any;
    namedNode(string): any;
    literal(a:string, b?:any): any; 
}
