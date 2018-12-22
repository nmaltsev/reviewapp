import { Pipe, PipeTransform } from '@angular/core';
import { Review } from '../models/sdm/review.model';
import { PhotonInterface } from '../models/photon-interface.model';

@Pipe({
  name: 'reviewFilter'
})
export class ReviewFilterPipe implements PipeTransform {

  transform(reviews: Review[], hasFilter: boolean, photonResults?: PhotonInterface[]): Review[] {
    let filtered: Review[] = [];

    console.log('Search %s', hasFilter);
    console.dir(photonResults);

    if (!hasFilter) { 
      filtered = reviews; 
    } else if (photonResults.length > 0) {
      filtered = reviews.filter((review:Review) => {
        // TODO optimize and sort by relevance
        let isChosen:boolean = false;
        if (review.thing) {
          isChosen = !!photonResults.find((photonResult:PhotonInterface) => {
            let queryId:string = photonResult.properties.osm_id.toString();

            if (
              review.thing.globalIdentifier && review.thing.globalIdentifier == queryId
            ) {
              return true;
            }

            if (review.thing.address) {
              if ((
                review.thing.address.countryGlobalId && review.thing.address.countryGlobalId == queryId
                ) || (
                review.thing.address.localityGlobalId && review.thing.address.localityGlobalId == queryId
              )) {
                return true;
              }

              // Pair "locality & country"
              if ((
                review.thing.address.locality &&
                review.thing.address.country &&
                // Attention: There may be not only cities. Need a debug
                review.thing.address.locality == photonResult.properties.city &&
                review.thing.address.country == photonResult.properties.country
              ) || (
                review.thing.address.locality &&
                review.thing.address.locality == photonResult.properties.city
              ) || (
                review.thing.address.country &&
                review.thing.address.country == photonResult.properties.country
              )) {
                return true;
              }
            }

            return false;
          });
        }
        return isChosen;
      });
    }
    return filtered;
  }
}
