import { Injectable } from '@angular/core';
import { RdfService } from './rdf.service';
import { Review } from '../models/review.model';
import { Property, PropertyType } from '../models/property.model';
import { Address } from '../models/address.model';
import { SolidProfile } from '../models/solid-profile.model';
import * as RDF from '../models/rdf.model';
import { SolidSession } from '../models/solid-session.model';
import * as SolidAPI  from '../models/solid-api';
import { IError, IHttpError } from '../models/exception.model';

declare let $rdf: RDF.IRDF;
declare let solid: SolidAPI.ISolidRoot;

interface IHash<type> {
  [key: string]: type;
}

const SCHEMAORG:RDF.Namespace = $rdf.Namespace('https://schema.org/');
const SOLID:RDF.Namespace = $rdf.Namespace('http://www.w3.org/ns/solid/terms#');
const REVIEW:RDF.Namespace = $rdf.Namespace('https://schema.org/Review#');
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

  constructor(private rdf: RdfService) {
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

  generateDocumentUID (): string {
    return '#' + this.sessionToken + '.' + this.generateRandToken(2);
  }
  generateRandToken(n: number): number {
		return ~~((1 << n *10) * Math.random());
  }

  clean(): void {
    this.reviews = {};
    this.publicTypeIndex = {};
    this.reviewTypeRegistration = {};
    this.reviewInstance = {};
  }
  
  async fetchPublicTypeIndex (webId: string, isForce: boolean = false): Promise<RDF.ITerm> {
    await this.rdf.fetcher.load(webId);

		this.publicTypeIndex[webId] = this.rdf.fetcher.store.any(
			$rdf.sym(webId), 
			SOLID('publicTypeIndex'), 
			null, 
      $rdf.sym(webId.split('#')[0]));
      
		// Load the person's data into the store
		await this.rdf.fetcher.load(this.publicTypeIndex[webId], {force: isForce});

  	// Get review details
		// this.reviewTypeRegistration[webId] = this.rdf.fetcher.store.any(
		// 	null, 
		// 	SOLID('forClass'), 
    //   // this.namespace.schemaOrg('Review')
    //   REVIEW('Review'),
    //   this.publicTypeIndex[webId] // null
    // );
    this.reviewTypeRegistration[webId] = this.rdf.fetcher.store.any(
			null, 
			SOLID('forClass'), 
      SCHEMAORG('Review'),
      this.publicTypeIndex[webId] // null
    );
    
    if (
      this.reviewTypeRegistration[webId] 
      && this.reviewTypeRegistration[webId].value
    ) {
			return this.reviewInstance[webId] = this.rdf.fetcher.store.any(
				this.reviewTypeRegistration[webId], 
				SOLID('instance')
      );
      
			// Subscribe on updation
			// this.updater.addDownstreamChangeListener(this.reviewInstance.doc(), async () => {
			// 	console.log('Reviews updated');
			// 	this.fetchReviews(true);
      // });
    } else { // There is no reviews.ttl
      if (this.rdf.session && this.rdf.session.webId == webId) {
        // If it is your own POD, you can create file
        const r: SolidAPI.IResponce = await this.createReviewFile(webId);

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
      headers: { 'Content-Type': 'application/sparql-update' },
      body: query,
      credentials: 'include',
    });
  } 

  async fetchReviews (webId: string, isForce: boolean = false): Promise<Review[]> {
    let reviews: Review[];

    try {
      // console.warn('[FetchReview] %s',webId);
      // console.dir(this.reviewInstance[webId])

      await this.rdf.fetcher.load(this.reviewInstance[webId], {force: isForce});
      reviews = this.extractReviews(await this.rdf.collectProfileData(webId), this.reviewInstance[webId]);
		} catch (error) {
      // Attention: there is strange backend behaviour. File may exists in the public index, but it doesn't exist on file system.
      if ((<IHttpError<SolidAPI.IResponce>>error).status == 404) {
        // Viewed profile does not have a review file
      } else if (this.rdf.session && this.rdf.session.webId == webId) {
        let r2:SolidAPI.IResponce = await solid.auth.fetch(this.reviewInstance[webId].value, {
          method : 'PATCH',
          headers : {'content-type' : 'application/sparql-update'},
          body : ''
        });
      }
			reviews = [];
    } finally {
      return this.reviews[webId] = reviews.sort(
        (a: Review, b: Review) => a.creationDate > b.creationDate ? -1 : a.creationDate < b.creationDate ? 1 : 0
      );
    }
  }
  
  private extractReviews(profile: SolidProfile, reviewInstance: RDF.ITerm): Review[] {
		const reviewStore: RDF.IState[] = this.rdf.fetcher.store.statementsMatching(
      null, 
			RDFns('type'), 
      SCHEMAORG('Review'),
      reviewInstance
    );

		if (reviewStore && reviewStore.length) {
      let reviews: Review[] = [];
      // console.warn('reviewStore %s', reviewInstance.value);
      // console.dir(reviewStore);

			for (var i = 0; i < reviewStore.length; i++) {
				let subject:RDF.ITerm = reviewStore[i].subject;
        
        let description:RDF.ITerm = this.rdf.fetcher.store.any(subject, SCHEMAORG('description'));
        let summary:RDF.ITerm = this.rdf.fetcher.store.any(subject, SCHEMAORG('name'));
        let datePublished:RDF.ITerm = this.rdf.fetcher.store.any(subject, SCHEMAORG('datePublished'));
        let hotelInstance:RDF.ITerm = this.rdf.fetcher.store.any(subject, SCHEMAORG('hotel'));
        let ratingInstance:RDF.ITerm = this.rdf.fetcher.store.any(subject, SCHEMAORG('reviewRating'));

        let review: Review = new Review(this.generateDocumentUID())
        .setContent(summary ? summary.value : '', description ? description.value : '')
        .setAuthor(profile)
        .setSubject(subject)
        .setCreation(datePublished.value ? new Date(datePublished.value) : null);

        
				if (hotelInstance) {
					let hotelName:RDF.ITerm = this.rdf.fetcher.store.any(hotelInstance, SCHEMAORG('name'));
					let addressInstance:RDF.ITerm = this.rdf.fetcher.store.any(hotelInstance, SCHEMAORG('address'));

          review.setProperty(
            new Property(PropertyType.hotel, hotelName ? hotelName.value : '', new Address())
          )
	
					if (addressInstance) {
						let country:RDF.ITerm = this.rdf.fetcher.store.any(addressInstance, SCHEMAORG('addressCountry'));
						let locality:RDF.ITerm = this.rdf.fetcher.store.any(addressInstance, SCHEMAORG('addressLocality'));
            review.property.address = new Address(
              locality ? locality.value : '',
              country ? country.value : ''
            );
					}
        }
        
        if (ratingInstance) {
          let ratingValue:RDF.ITerm = this.rdf.fetcher.store.any(ratingInstance, SCHEMAORG('ratingValue'));
          
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

  async getReviews(webId: string, isForce:boolean = false): Promise<Review[]> {
    // console.log('[getReviews] webId: %s', webId);
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

  private escape4rdf(property: string): string {
    console.log(property);
		return property.replace(/\"/g, '\'');
	}

  async saveReview(review: Review): Promise<SolidAPI.IResponce> {
    let reviewInstance: RDF.ITerm = await this.fetchPublicTypeIndex(review.author.webId, true);

    if (reviewInstance) { // else we have not got opportunity to save anything
      const date_s:string = new Date().toISOString();
      const source:string = reviewInstance.value;
      const query:string = `INSERT DATA {
        @prefix schema: <https://schema.org/> .
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
        @prefix foaf: <http://xmlns.com/foaf/0.1/>.
  
        <${review.id}> a schema:Review ;
        foaf:maker <${review.author.webId}>;
        schema:author ""^^xsd:string ;
        schema:datePublished "${date_s}"^^schema:dateTime ;
        schema:description """${this.escape4rdf(review.text)}"""^^xsd:string ;
        schema:name """${this.escape4rdf(review.summary)}"""^^xsd:string ;
        schema:reviewRating [
          a schema:Rating ;
          schema:bestRating "5"^^xsd:string ;
          schema:ratingValue "${review.rating}"^^xsd:string ;
          schema:worstRating "1"^^xsd:string
        ] ;
        schema:hotel [
          a schema:Hotel ;
          schema:name """${this.escape4rdf(review.property.name)}"""^^xsd:string ;
          schema:identifier """${review.property.osm_id}"""^^xsd:string;
          schema:address [
            a schema:PostalAddress ;
            schema:addressCountry "${this.escape4rdf(review.property.address.countryName)}"^^xsd:string ;
            schema:addressLocality "${this.escape4rdf(review.property.address.locality)}"^^xsd:string ;
            schema:addressRegion "${review.property.address.region}"^^xsd:string ;
            schema:postalCode ""^^xsd:string ;
            schema:streetAddress "${review.property.address.street}"^^xsd:string
          ] ;
        ] .
      }`;
      // Send a PATCH request to update the source
      return await solid.auth.fetch(source, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/sparql-update' },
        body: query,
        credentials: 'include',
      });
    } else {
      // Probably, we just created review file and now we need to create review instance  
      return await this.saveReview(review);
    }
  }

  async removeReview(review: Review):Promise<void> {
    if (!review.subject) {
      console.warn('No subject in review');
      return;
    }

    this.rdf.fetcher.store.removeMany(review.subject);
    const requestBody: string = (<RDF.ISerialize>new $rdf.Serializer(this.rdf.fetcher.store)).toN3(this.rdf.fetcher.store);const webId:string = review.author.webId;
    
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
      let pos:number = this.reviews[webId].indexOf(review);
      
      this.reviews[webId] = this.reviews[webId].splice(pos, 1);
    } else {
      console.warn('That author does not have reviews');
    }
  }
}
