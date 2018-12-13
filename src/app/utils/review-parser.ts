import * as RDF from '../models/rdf.model';
import * as SolidAPI from '../models/solid-api';
import { SolidProfile } from '../models/solid-profile.model';
import { Review } from '../models/review.model';
import { Property, PropertyType } from '../models/property.model';
import { Address } from '../models/address.model';

declare let $rdf: RDF.IRDF;

const SCHEMAORG: RDF.Namespace = $rdf.Namespace('https://schema.org/');
const RDFns: RDF.Namespace = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

function extractId(url: string) {
    let i:number = url.indexOf('#');

    return i > -1 ? url.substr(i + 1) : '';
}
export function reviewParser(graph: RDF.IGraph ,profile: SolidProfile, fileUrl?:string): Review[] {
    const reviewStore: RDF.IState[] = graph.statementsMatching(
        null, RDFns('type'), SCHEMAORG('Review'), fileUrl ? $rdf.sym(fileUrl): null);

    if (!Array.isArray(reviewStore)) {
        return [];
    }
    const reviews: Review[] = [];

    let i:number = reviewStore.length;
    while (i-- > 0) {
        let subject: RDF.ITerm = reviewStore[i].subject;
        let description: RDF.ITerm = graph.any(subject, SCHEMAORG('description'));
        let summary: RDF.ITerm = graph.any(subject, SCHEMAORG('name'));
        let datePublished: RDF.ITerm = graph.any(subject, SCHEMAORG('datePublished'));
        let ratingInstance: RDF.ITerm = graph.any(subject, SCHEMAORG('reviewRating'));
        let review: Review = new Review(extractId(subject.value))
            .setContent(summary ? summary.value : '', description ? description.value : '')
            .setAuthor(profile)
            .setSubject(subject)
            .setCreation(datePublished.value ? new Date(datePublished.value) : null);
        // TODO change to something more general
        const isHotel = graph.any(subject, SCHEMAORG('hotel'));
        const buildingInstance: RDF.ITerm = isHotel ?
            isHotel :
            graph.any(subject, SCHEMAORG('restaurant'));
        
        if (buildingInstance) {
            let buildingName: RDF.ITerm = graph.any(buildingInstance, SCHEMAORG('name'));
            let addressInstance: RDF.ITerm = graph.any(buildingInstance, SCHEMAORG('address'));
            review.setProperty(
                new Property(
                isHotel ? PropertyType.hotel : PropertyType.restaurant,
                buildingName ? buildingName.value : '', new Address())
            );
            
            if (addressInstance) {
                let country: RDF.ITerm = graph.any(addressInstance, SCHEMAORG('addressCountry'));
                let locality: RDF.ITerm = graph.any(addressInstance, SCHEMAORG('addressLocality'));
                review.property.address = new Address(locality ? locality.value : '', country ? country.value : '');
            }
        }
        if (ratingInstance) {
            let ratingValue: RDF.ITerm = graph.any(ratingInstance, SCHEMAORG('ratingValue'));
            
            if (ratingValue) {
                review.setRating(ratingValue.value);
            }
        }
        reviews.push(review);
    }
    console.log('Parsed');
    console.dir(reviews);
    return reviews;
}