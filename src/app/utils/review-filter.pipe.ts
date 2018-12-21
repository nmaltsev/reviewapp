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
        if (review.thing && review.thing.globalIdentifier) {
          return queryIds.indexOf(review.thing.globalIdentifier) !== -1;
        }
      });
    }
    return filtered;
  }

}
