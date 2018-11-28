import { Injectable } from '@angular/core';
import { RdfService } from './rdf.service';
import { Review } from '../models/review.model';
import { Property, PropertyType } from '../models/property.model';
import { Address } from '../models/address.model';
import { SolidProfile } from '../models/solid-profile.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  constructor(private rdf: RdfService) {}

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
