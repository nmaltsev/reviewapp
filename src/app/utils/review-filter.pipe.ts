import { Pipe, PipeTransform } from '@angular/core';
import { Review } from '../models/sdm/review.model';
import { Search } from './search-engine';

@Pipe({
  name: 'reviewFilter'
})
export class ReviewFilterPipe implements PipeTransform {

  transform(reviews: Review[], query?: string): Review[] {
    if (query.length > 2) {
      let search:Search = new Search(query);
      
      return reviews.filter((review: Review) => search.compare(review) > 0);
    }
    return reviews;
  }

}
