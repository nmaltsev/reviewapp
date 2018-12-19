import * as RDF from '../models/rdf.model';
import * as SolidAPI from '../models/solid-api';
import { SolidProfile } from '../models/solid-profile.model';
import { Review, VisibilityTypes } from '../models/sdm/review.model';
import { Place } from '../models/sdm/place.model';
import { AddressModel } from '../models/sdm/address.model';
import {ITerm} from '../models/rdf.model';

declare let $rdf: RDF.IRDF;

const SCHEMAORG: RDF.Namespace = $rdf.Namespace('https://schema.org/');
const RDFns: RDF.Namespace = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

function extractId(url: string) {
    const i: number = url.indexOf('#');
    return i > -1 ? url.substr(i + 1) : '';
}

export function reviewParser(
    graph: RDF.IGraph,
    profile: SolidProfile,
    fileUrl: string,
    visibilityType: VisibilityTypes
): Review[] {
    const reviewStore: RDF.IState[] = graph.statementsMatching(
        null, RDFns('type'), SCHEMAORG('Review'), fileUrl ? $rdf.sym(fileUrl) : null);

    if (!Array.isArray(reviewStore)) {
        return [];
    }
    const reviews: Review[] = [];

    let i: number = reviewStore.length;
    while (i-- > 0) {
        const subject: RDF.ITerm = reviewStore[i].subject;
        const description: RDF.ITerm = graph.any(subject, SCHEMAORG('description'));
        const summary: RDF.ITerm = graph.any(subject, SCHEMAORG('name'));
        const datePublished: RDF.ITerm = graph.any(subject, SCHEMAORG('datePublished'));
        const ratingInstance: RDF.ITerm = graph.any(subject, SCHEMAORG('reviewRating'));
        const review: Review = new Review(extractId(subject.value))
            .setContent(summary ? summary.value : '', description ? description.value : '')
            .setAuthor(profile)
            .setSubject(subject)
            .setCreation(datePublished.value ? new Date(datePublished.value) : null);
        review.visibilityType = visibilityType;
        // TODO change to something more general
        const placeInstance = graph.any(subject, SCHEMAORG('Thing'));
        if (placeInstance) {
            const buildingName: RDF.ITerm = graph.any(placeInstance, SCHEMAORG('name'));
            const placeGlobalId: RDF.ITerm = graph.any(placeInstance, SCHEMAORG('identifier'));
            const addressInstance: RDF.ITerm = graph.any(placeInstance, SCHEMAORG('address'));
            const thingType: RDF.ITerm = graph.any(placeInstance, RDFns('type'));
            review.setThing(
                new Place(
                thingType ? thingType.value : 'https://schema.org/Hotel',
                buildingName ? buildingName.value : '', new AddressModel(),
                placeGlobalId ? placeGlobalId.value : '')
            );

            if (addressInstance) {
                const streetAddress: RDF.ITerm = graph.any(addressInstance, SCHEMAORG('streetAddress'));
                const countryInstance: RDF.ITerm = graph.any(addressInstance, SCHEMAORG('addressCountry'));
                    const country: RDF.ITerm = graph.any(countryInstance, SCHEMAORG('name'));
                    const countryGlobalId: RDF.ITerm = graph.any(countryInstance, SCHEMAORG('identifier'));
                const localityInstance: RDF.ITerm = graph.any(addressInstance, SCHEMAORG('addressLocality'));
                    const locality: RDF.ITerm = graph.any(localityInstance, SCHEMAORG('name'));
                    const localityGlobalId: RDF.ITerm = graph.any(localityInstance, SCHEMAORG('identifier'));
                review.thing.address = new AddressModel(
                  country ? country.value : '',
                    locality ? locality.value : '',
                    streetAddress ? streetAddress.value : '',
                  countryGlobalId ? countryGlobalId.value : '',
                  localityGlobalId ? localityGlobalId.value : '',
                );
            }
        }
        if (ratingInstance) {
            const ratingValue: RDF.ITerm = graph.any(ratingInstance, SCHEMAORG('ratingValue'));

            if (ratingValue) {
                review.setRating(ratingValue.value);
            }
        }
        reviews.push(review);
    }
    return reviews;
}
