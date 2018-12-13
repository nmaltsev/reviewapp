import {Injectable} from '@angular/core';
import {RdfService} from './rdf.service';
import {Review} from '../models/review.model';
import * as RDF from '../models/rdf.model';
import * as SolidAPI from '../models/solid-api';
import {IHttpError} from '../models/exception.model';
import { GraphSync } from '../models/sync.model';
import { reviewParser } from '../utils/review-parser';

declare let $rdf: RDF.IRDF;
declare let solid: SolidAPI.ISolidRoot;

interface IHash<type> {
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

  constructor(private rdf: RdfService) {
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

  private async fetchReviews2(webId: string, resourceUrl: string): Promise<Review[]> {
    let gsync:GraphSync = this.store[webId] = new GraphSync(resourceUrl);

    return Promise.all([
      this.rdf.collectProfileData(webId), // get profile info
      gsync.load() // download public review.ttl file 
    ]).then(([profile, graph]) => { // ;) TScript does not support type definition in destructors
      return this.reviews[webId] = reviewParser(graph, profile, resourceUrl).sort(
        (a: Review, b: Review) =>
          a.creationDate > b.creationDate ? -1 : a.creationDate < b.creationDate ? 1 : 0
      );
    }).catch(async (error) => {
      // Attention: there is strange backend behaviour. File may exists in the public index, but it doesn't exist on file system.
      if ((<IHttpError<SolidAPI.IResponce>>error).status == 404) {
        // Viewed profile does not have a review file
      } else if (this.rdf.session && this.rdf.session.webId == webId) {
        await solid.auth.fetch(resourceUrl, {
          method: 'PATCH',
          headers: {'content-type': 'application/sparql-update'},
          body: ''
        });
      }
      return this.reviews[webId] = [];
    });
  }

  async getReviews(webId: string, isForce: boolean = false): Promise<Review[]> {
    if (
      !this.reviews[webId] || !this.publicTypeIndex[webId] || isForce
    ) {
      let publicFile: RDF.ITerm;
      if (publicFile = await this.fetchPublicTypeIndex(webId, isForce)) {
        console.log('P');
        console.dir(publicFile);

        // return await this.fetchReviews(webId, true);
        return await this.fetchReviews2(webId, publicFile && publicFile.value);
      } else {
        return [];
      }
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
    const store: GraphSync = this.store[review.author.webId];

    if (store) {
      let n = store.removeEntry(review.id);  
      console.log('Removed', n);
      await store.update();
    }

    if (this.reviews[webId]) {
      let pos: number = this.reviews[webId].indexOf(review);

      this.reviews[webId] = this.reviews[webId].splice(pos, 1);
    } else {
      console.warn('That author does not have reviews');
    }
  }
}
