import { Injectable } from '@angular/core';
import { RdfService } from './rdf.service';
import { Review } from '../models/review.model';
import { Property, PropertyType } from '../models/property.model';
import { Address } from '../models/address.model';
import { SolidProfile } from '../models/solid-profile.model';
import * as RDF from '../models/rdf.model';
import { SolidSession } from '../models/solid-session.model';

declare let $rdf: RDF.IRDF;
const SCHEMAORG:RDF.Namespace = $rdf.Namespace('http://xmlns.com/foaf/0.1/');

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private sessionToken: number;

  constructor(private rdf: RdfService) {
    this.sessionToken = this.generateRandToken(2);

    this.rdf.getSession().then((session: SolidSession) => {
      console.log('Session ready for ReviewService');
    });
  }

  generateDocumentUID (): string {
    return '#' + this.sessionToken + '.' + this.generateRandToken(2);
  }
  generateRandToken(n: number): number {
		return ~~((1 << n *10) * Math.random());
  }
  
  /*async fetchPublicTypeIndex () {
		this.publicTypeIndex = this.fetcher.store.any(
			$rdf.sym(this.webId), 
			this.namespace.solid('publicTypeIndex'), 
			null, 
			$rdf.sym(this.webId.split('#')[0]));

		// Load the person's data into the store
		await this.fetcher.load(this.publicTypeIndex);

  	// Get review details
		this.reviewTypeRegistration = this.fetcher.store.any(
			null, 
			this.namespace.solid('forClass'), 
			// this.namespace.schemaOrg('Review')
			this.namespace.review('Review')
		);

		if (this.reviewTypeRegistration && this.reviewTypeRegistration.value) {
			this.reviewInstance = this.fetcher.store.any(
				this.reviewTypeRegistration, 
				this.namespace.solid('instance')
			);			

			// Subscribe on updation
			this.updater.addDownstreamChangeListener(this.reviewInstance.doc(), async () => {
				console.log('Reviews updated');
				this.fetchReviews(true);
			});

			await this.fetchReviews();
		} else { // There is no reviews.ttl, create it
			this.createReviewFile();
			this.reviews = [];
		}
  }*/

  private getFakeData(profile:SolidProfile): Review[] {
    return [
      new Review(
        '#1.1', 
        'Close to the beach', 
        'Great location close to the beach and the old town (including cafes and restaurants). Lovely hotel staff and a good breakfast in the morning. Room was spacious with a good bathroom. Hotel Gounod has a ‘sister hotel’ next door that has a gym, pool and rooftop bar that you can access but we didn’t go.'
      )
      .setProperty(
        new Property(PropertyType.hotel, 'Hotel Gounod Nice', new Address('France', 'Nice'))
      )
      .setAuthor(profile)
      .setCreation(new Date(Date.now() - ~~(Math.random() * 100000000)))
      .setRating(3.5),
      new Review(
        '#1.2',
        'Short but excellent stay',
        'I arrived late and left early. A quick call from the information desk at the airport and the shuttle came to pick me up. A friendly welcome from Fatou and I was in my room. I would stay here again to visit Nice for a longer stay'
      )
      .setProperty(new Property(PropertyType.hotel, 'Ibis Styles Nice Airport Arenas', new Address('France', 'Nice'))) 
      .setAuthor(profile)
      .setCreation(new Date(Date.now() - ~~(Math.random() * 100000)))
      .setRating(4.2),
    ];
  }

  getReviews(profile:SolidProfile): Review[] {
    // TODO Do some magic
    return this.getFakeData(profile);
  }
}
