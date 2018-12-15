import { stringify } from "@angular/core/src/util";

// Definition of $rdf lib.
// TODO to develop it

export interface ITerm {
    termType: string;
    value: any; // may be it allways string or ITerm
    readonly uri: string; // just js getter
    doc(): ITerm; 
    dir(): ITerm; // get parent folder
    site(): ITerm; // get root
    toNT(): string;
}

export interface IState {
    predicate: ITerm;
    subject: ITerm;
    object: ITerm;
}

export interface IGraph {
    any(a1:ITerm, a2:string, a3?:string|ITerm, a4?:ITerm): ITerm;
    each(subject: ITerm, predicate?: string|ITerm, object?: ITerm, graph?: ITerm): ITerm[];
    statementsMatching(a1?:ITerm, a2?:string, a3?:string, a4?:ITerm): IState[];
    removeMany(ITerm): void;
    statements: ITerm[];
    add(a?:ITerm, b?:string, c?:string|ITerm|IValue);
}

export interface IFetcherProperties {
    force?: boolean; // Force loading data from POD
}
export interface IFetcher {
    //  Load data from POD
    load(resource: string | ITerm, p?: IFetcherProperties): Promise<void>;
    store: IGraph;
};
export interface IUpdateManager {
    update(deletions: any[], insertions: any[], cb: (response: any, success: any, message: any) => void): void;
}

export interface ISerialize {
    toN3(IStore): string;
}

export type Namespace = (string) => string;
export type FetcherConstructor = (Store, Object) => void;
export type UpdateManagerConstructor = (Store) => void;
export type SerializerConstructor = (IStore) => void;

export interface IValue {
    datatype: ITerm;
    termType: string;
    value: string;
    toNT(): string;
} 
export interface IRDF {
    sym(string): ITerm;
    Namespace(string): Namespace;
    graph(): IGraph;
    Fetcher: FetcherConstructor;
    UpdateManager: UpdateManagerConstructor;
    st(subject:ITerm|string, predicate:ITerm|string, object:ITerm|string, why:ITerm|string): ITerm;
    NamedNode: any;
    namedNode(string): any;
    literal(a:string, b?:any): any; 
    Serializer: SerializerConstructor;
    term(a:Number|Boolean|String): IValue;
    parse(content: string, graph: IGraph, host: string, contentType: string): void;
}
