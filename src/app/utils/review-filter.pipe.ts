import { Pipe, PipeTransform } from '@angular/core';
import { Review } from '../models/sdm/review.model';

@Pipe({
  name: 'reviewFilter'
})
export class ReviewFilterPipe implements PipeTransform {

  transform(reviews: Review[], queryIds?: string[]): Review[] {
    let filtered = reviews;
    if (queryIds.length > 0) {
      filtered = reviews.filter(review => {
        // TODO optimize and sort by relevance
        let isChosen = false;
        if (review.thing) {
          if (review.thing.globalIdentifier) {
            isChosen = isChosen || queryIds.indexOf(review.thing.globalIdentifier) !== -1;
          }
          if (review.thing.address) {
            if (review.thing.address.countryGlobalId) {
              isChosen = isChosen || queryIds.indexOf(review.thing.address.countryGlobalId) !== -1;
            }
            if (review.thing.address.localityGlobalId) {
              isChosen = isChosen || queryIds.indexOf(review.thing.address.localityGlobalId) !== -1;
            }
          }
        }
        return isChosen;
      });
    }
    return filtered;
  }

}
