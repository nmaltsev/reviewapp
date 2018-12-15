import {Injectable} from '@angular/core';
import {RdfService} from './rdf.service';
import {Review, VisibilityTypes} from '../models/review.model';
import * as RDF from '../models/rdf.model';
import * as SolidAPI from '../models/solid-api';
import {IHttpError} from '../models/exception.model';
import { GraphSync } from '../models/sync.model';
import { reviewParser } from '../utils/review-parser';
import { PrivateStorageService } from './private-storage/private-storage.service';
import { tools } from '../utils/tools';

declare let $rdf: RDF.IRDF;
declare let solid: SolidAPI.ISolidRoot;

export interface IHash<type> {
  [key: string]: type;
}

const SCHEMAORG: RDF.Namespace = $rdf.Namespace('https://schema.org/');
const SOLID: RDF.Namespace = $rdf.Namespace('http://www.w3.org/ns/solid/terms#');
const REVIEW: RDF.Namespace = $rdf.Namespace('https://schema.org/Review#');
const RDFns: RDF.Namespace = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviews: IHash<Review[]> = {};
  private publicTypeIndex: IHash<RDF.ITerm> = {};
  private reviewTypeRegistration: IHash<RDF.ITerm> = {};
  private reviewInstance: IHash<RDF.ITerm> = {};
  private graph: RDF.IGraph = $rdf.graph();
  private fetcher: RDF.IFetcher;
  private store: IHash<GraphSync> = {};
  private selfPrivateStore:GraphSync;

  constructor(
    private rdf: RdfService,
    private privateStorage: PrivateStorageService
  ) {
    this.fetcher = new $rdf.Fetcher(this.graph, {});
    this.rdf.getSession();

    window['model'] = this;
    window['ns'] = {
      RDF: RDFns,
      SCHEMAORG,
      REVIEW,
      SOLID
    };
  }

  clean(): void {
    this.reviews = {};
    this.publicTypeIndex = {};
    this.reviewTypeRegistration = {};
    this.reviewInstance = {};
    this.store = {};
  }

  async fetchPublicTypeIndex(webId: string, isForce: boolean = false): Promise<RDF.ITerm> {
    await this.fetcher.load(webId);

    this.publicTypeIndex[webId] = this.fetcher.store.any(
      $rdf.sym(webId), SOLID('publicTypeIndex'), null, $rdf.sym(webId.split('#')[0])
    );
    // Load the person's data into the store
    await this.fetcher.load(this.publicTypeIndex[webId], {force: isForce});

    this.reviewTypeRegistration[webId] = this.fetcher.store.any(
      null, SOLID('forClass'), SCHEMAORG('Review'), this.publicTypeIndex[webId] // null
    );
    if (
      this.reviewTypeRegistration[webId]
      && this.reviewTypeRegistration[webId].value
    ) {
      return this.reviewInstance[webId] = this.fetcher.store.any(
        this.reviewTypeRegistration[webId], SOLID('instance')
      );
      // Attention: It is possible to subscribe on changes in file 
      // this.updater.addDownstreamChangeListener(this.reviewInstance.doc(), async () => {
      // 	console.log('Reviews updated');
      // 	this.fetchReviews(true);
      // });
    } else { // There is no reviews.ttl
      if (this.rdf.session && this.rdf.session.webId == webId) {
        // If it is your own POD, you can create file
        const r: SolidAPI.IResponce = await this.createReviewFile(webId, this.publicTypeIndex[webId]);
      }
    }
  }

  private async createReviewFile(webId: string, publicTypeIndex: RDF.ITerm): Promise<any> {
    const query: string = `INSERT DATA {
      <#Review> a <http://www.w3.org/ns/solid/terms#TypeRegistration> ;
        <http://www.w3.org/ns/solid/terms#forClass> <https://schema.org/Review> ;
        <http://www.w3.org/ns/solid/terms#instance> </public/reviews.ttl> .
        <> <http://purl.org/dc/terms/references> <#Review> .
      }`;
    // Send a PATCH request to update the source
    return await solid.auth.fetch(publicTypeIndex.value, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/sparql-update'},
      body: query,
      credentials: 'include',
    });
  }

  // Fetch public reviews
  private async fetchReviews2(
    webId: string, 
    publicResourceUrl:string, 
    privateResourceUrl: string
  ): Promise<Review[]> {
    let gsync:GraphSync = this.store[webId] = new GraphSync(publicResourceUrl);
    let privateSync:GraphSync = new GraphSync(privateResourceUrl);
    const isSelfProfile: boolean = this.rdf.session && this.rdf.session.webId == webId;

    if (isSelfProfile) {
      this.selfPrivateStore = privateSync
    }

    return Promise.all([
      // get profile info:
      this.rdf.collectProfileData(webId), 
      // get public reviews:
      publicResourceUrl ? 
        gsync.load().catch(async (error) => {
          // Attention: there is strange backend behaviour. File may exists in the public index, but it doesn't exist on file system.
          if ((<IHttpError<SolidAPI.IResponce>>error).status == 404) {
            // Viewed profile does not have a review file
          } else if (isSelfProfile) {
            await solid.auth.fetch(publicResourceUrl, {
              method: 'PATCH',
              headers: {'content-type': 'application/sparql-update'},
              body: ''
            });
          }
          return null;
        }) 
        : Promise.resolve(null), 
      // get private reviews:
      privateResourceUrl ? 
        privateSync.load().catch((error) => {return null;})
        : Promise.resolve(null), 
    ]).then(([profile, publicGraph, privateGraph]) => { // ;) TScript does not support type definition in destructors
      let reviews: Review[] = [];
      
      return this.reviews[webId] = reviews.concat(
        publicGraph ? reviewParser(publicGraph, profile, publicResourceUrl, VisibilityTypes.public) : [],
        privateGraph ? reviewParser(privateGraph, profile, privateResourceUrl, VisibilityTypes.friends) : [],
      ).sort(
        (a: Review, b: Review) =>
          a.creationDate > b.creationDate ? -1 : a.creationDate < b.creationDate ? 1 : 0
      );
    });
  }

  async getReviews(webId: string, isForce: boolean = false): Promise<Review[]> {
    if (
      !this.reviews[webId] || !this.publicTypeIndex[webId] || isForce
    ) {
      let publicFile: RDF.ITerm = await this.fetchPublicTypeIndex(webId, isForce);
      let privateFile: string = this.privateStorage.getUrl(webId);
      
      return await this.fetchReviews2(webId, publicFile && publicFile.value, privateFile);
    } else {
      return this.reviews[webId];
    }
  }

  async saveReview(review: Review): Promise<SolidAPI.IResponce> {
    let reviewInstance: RDF.ITerm = await this.fetchPublicTypeIndex(review.author.webId, true);

    if (reviewInstance) { // else we have not got opportunity to save anything
      const date_s: string = new Date().toISOString();
      const source: string = reviewInstance.value;
      const query: string = `INSERT DATA { ${review.toTTL(new Date())}}`;
      // Send a PATCH request to update the source
      return await solid.auth.fetch(source, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/sparql-update'},
        body: query,
        credentials: 'include',
      });
    } else {
      // Probably, we just created review file and now we need to create review instance  
      return await this.saveReview(review);
    }
  }

  async removeReview(review: Review): Promise<void> {
    const webId: string = review.author.webId;
    const store: GraphSync = 
      review.visibilityType == VisibilityTypes.public ? 
        this.store[review.author.webId] : this.selfPrivateStore;

    // Removing review from 
    if (store) {
      let n = store.removeEntry(review.id);  
      console.log('Removed', n);
      await store.update();
    }

    // Removing review from UI
    if (this.reviews[webId]) {
      // let pos: number = this.reviews[webId].indexOf(review);
      // this.reviews[webId] = this.reviews[webId].splice(pos, 1);
      this.reviews[webId] = tools.removeItem<Review>(this.reviews[webId], review);
    } else {
      console.warn('That author does not have reviews');
    }
  }
}
