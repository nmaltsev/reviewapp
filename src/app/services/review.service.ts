import {Injectable} from '@angular/core';
import {RdfService} from './rdf.service';
import {Review} from '../models/review.model';
import {Property, PropertyType} from '../models/property.model';
import {Address} from '../models/address.model';
import {SolidProfile} from '../models/solid-profile.model';
import * as RDF from '../models/rdf.model';
import * as SolidAPI from '../models/solid-api';
import {IHttpError} from '../models/exception.model';

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
  private sessionToken: number;

  private reviews: IHash<Review[]> = {};
  private publicTypeIndex: IHash<RDF.ITerm> = {};
  private reviewTypeRegistration: IHash<RDF.ITerm> = {};
  private reviewInstance: IHash<RDF.ITerm> = {};
  private graph: RDF.IGraph = $rdf.graph();
  private fetcher: RDF.IFetcher;

  constructor(private rdf: RdfService) {
    this.fetcher = new $rdf.Fetcher(this.graph, {});
    this.sessionToken = this.generateRandToken(2);
    this.rdf.getSession();

    window['model'] = this;
    window['ns'] = {
      RDF: RDFns,
      SCHEMAORG,
      REVIEW,
      SOLID
    };
  }

  generateDocumentUID(): string {
    return '#' + this.sessionToken + '.' + this.generateRandToken(2);
  }

  generateRandToken(n: number): number {
    return ~~((1 << n * 10) * Math.random());
  }

  clean(): void {
    this.reviews = {};
    this.publicTypeIndex = {};
    this.reviewTypeRegistration = {};
    this.reviewInstance = {};
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
      // TODO remove useless comments
      // Subscribe on updation
      // this.updater.addDownstreamChangeListener(this.reviewInstance.doc(), async () => {
      // 	console.log('Reviews updated');
      // 	this.fetchReviews(true);
      // });
    } else { // There is no reviews.ttl
      if (this.rdf.session && this.rdf.session.webId == webId) {
        // If it is your own POD, you can create file
        const r: SolidAPI.IResponce = await this.createReviewFile(webId);
        // TODO remove useless comments
        // if (r.status == 200) {
        //   return await this.fetchPublicTypeIndex(webId, true);
        // }
      }
    }
  }

  private async createReviewFile(webId: string): Promise<any> {
    const query: string = `INSERT DATA {
      <#Review> a <http://www.w3.org/ns/solid/terms#TypeRegistration> ;
        <http://www.w3.org/ns/solid/terms#forClass> <https://schema.org/Review> ;
        <http://www.w3.org/ns/solid/terms#instance> </public/reviews.ttl> .
        <> <http://purl.org/dc/terms/references> <#Review> .
      }`;
    // Send a PATCH request to update the source
    return await solid.auth.fetch(this.publicTypeIndex[webId].value, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/sparql-update'},
      body: query,
      credentials: 'include',
    });
  }

  async fetchReviews(webId: string, isForce: boolean = false): Promise<Review[]> {
    let reviews: Review[];

    try {
      await this.fetcher.load(this.reviewInstance[webId], {force: isForce});
      reviews = this.extractReviews(await this.rdf.collectProfileData(webId), this.reviewInstance[webId]);
    } catch (error) {
      // Attention: there is strange backend behaviour. File may exists in the public index, but it doesn't exist on file system.
      if ((<IHttpError<SolidAPI.IResponce>>error).status == 404) {
        // Viewed profile does not have a review file
      } else if (this.rdf.session && this.rdf.session.webId == webId) {
        let r2: SolidAPI.IResponce = await solid.auth.fetch(this.reviewInstance[webId].value, {
          method: 'PATCH',
          headers: {'content-type': 'application/sparql-update'},
          body: ''
        });
      }
      reviews = [];
    } finally {
      return this.reviews[webId] = reviews.sort(
        (a: Review, b: Review) =>
          a.creationDate > b.creationDate ? -1 : a.creationDate < b.creationDate ? 1 : 0
      );
    }
  }

  private extractReviews(profile: SolidProfile, reviewInstance: RDF.ITerm): Review[] {
    const reviewStore: RDF.IState[] = this.fetcher.store.statementsMatching(
      null, RDFns('type'), SCHEMAORG('Review'), reviewInstance);
    if (reviewStore && reviewStore.length) {
      const reviews: Review[] = [];
      for (let i = 0; i < reviewStore.length; i++) {
        let subject: RDF.ITerm = reviewStore[i].subject;
        let description: RDF.ITerm = this.fetcher.store.any(subject, SCHEMAORG('description'));
        let summary: RDF.ITerm = this.fetcher.store.any(subject, SCHEMAORG('name'));
        let datePublished: RDF.ITerm = this.fetcher.store.any(subject, SCHEMAORG('datePublished'));
        let ratingInstance: RDF.ITerm = this.fetcher.store.any(subject, SCHEMAORG('reviewRating'));
        let review: Review = new Review(this.generateDocumentUID())
          .setContent(summary ? summary.value : '', description ? description.value : '')
          .setAuthor(profile)
          .setSubject(subject)
          .setCreation(datePublished.value ? new Date(datePublished.value) : null);
        // TODO change to something more general
        const isHotel = this.fetcher.store.any(subject, SCHEMAORG('hotel'));
        const buildingInstance: RDF.ITerm = isHotel ?
          isHotel :
          this.fetcher.store.any(subject, SCHEMAORG('restaurant'));
        if (buildingInstance) {
          let buildingName: RDF.ITerm = this.fetcher.store.any(buildingInstance, SCHEMAORG('name'));
          let addressInstance: RDF.ITerm = this.fetcher.store.any(buildingInstance, SCHEMAORG('address'));
          review.setProperty(
            new Property(
              isHotel ? PropertyType.hotel : PropertyType.restaurant,
              buildingName ? buildingName.value : '', new Address())
          );
          if (addressInstance) {
            let country: RDF.ITerm = this.fetcher.store.any(addressInstance, SCHEMAORG('addressCountry'));
            let locality: RDF.ITerm = this.fetcher.store.any(addressInstance, SCHEMAORG('addressLocality'));
            review.property.address = new Address(locality ? locality.value : '', country ? country.value : '');
          }
        }
        if (ratingInstance) {
          let ratingValue: RDF.ITerm = this.fetcher.store.any(ratingInstance, SCHEMAORG('ratingValue'));
          if (ratingValue) {
            review.setRating(ratingValue.value);
          }
        }
        reviews.push(review);
      }
      return reviews;
    } else {
      return [];
    }
  }

  async getReviews(webId: string, isForce: boolean = false): Promise<Review[]> {
    if (
      !this.reviews[webId] || !this.publicTypeIndex[webId] || isForce
    ) {
      if (await this.fetchPublicTypeIndex(webId, isForce)) {
        return await this.fetchReviews(webId, true);
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
    if (!review.subject) {
      console.warn('No subject in review');
      return;
    }

    this.fetcher.store.removeMany(review.subject);
    const requestBody: string = (<RDF.ISerialize>new $rdf.Serializer(this.fetcher.store)).toN3(this.fetcher.store);
    // console.log('Request Body %s', requestBody);
    console.dir(this.fetcher.store);
    return;

    const webId: string = review.author.webId;

    // let query:string =  `DELETE DATA { ${review.subject.toNT()} }`;
    // console.log(query);

    // await solid.auth.fetch(this.reviewInstance[webId].value, {
    // 	method: 'PATCH',
    // 	headers: { 'Content-Type': 'application/sparql-update' },
    // 	body: query,
    // 	credentials: 'include',
    // });
    await solid.auth.fetch(this.reviewInstance[webId].value, {
        method: 'PUT',
        // method: 'PATCH',
        headers: {
          'Content-Type': 'text/turtle',
        },
        credentials: 'include',
        body: requestBody
      }
    );

    if (this.reviews[webId]) {
      let pos: number = this.reviews[webId].indexOf(review);

      this.reviews[webId] = this.reviews[webId].splice(pos, 1);
    } else {
      console.warn('That author does not have reviews');
    }
  }
}
