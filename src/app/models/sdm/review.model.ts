import {ThingInterface} from './place.model';
import {SolidProfile} from '../solid-profile.model';
import {ITerm} from '../rdf.model';
import {Helper} from '../../utils/helper';

export enum VisibilityTypes {
    public,
    friends
}

export class Review {
    summary: string;
    text: string;
    id: string;
    thing: ThingInterface;
    // property: Property;
    author: SolidProfile;
    rating = 0;
    creationDate: Date;
    subject: ITerm;
    visibilityType: VisibilityTypes;

    constructor (id: string) {
        this.id = id;
    }
    setContent(summary: string, text: string): Review {
        this.summary = summary;
        this.text = text;
        return this;
    }
    setThing(thing: ThingInterface): Review {
        this.thing = thing;
        return this;
    }
    setAuthor(profile: SolidProfile): Review {
        this.author = profile;
        return this;
    }
    setRating(rating: number): Review {
        this.rating = rating;
        return this;
    }
    setCreation(date: Date): Review {
        this.creationDate = date;
        return this;
    }
    setSubject(subj: ITerm): Review {
        this.subject = subj;
        return this;
    }
    clone(id: string): Review {
        return new Review(id || this.id)
            .setContent(this.summary, this.text)
            .setAuthor(this.author)
            .setCreation(this.creationDate ? new Date(this.creationDate) : new Date())
            .setRating(this.rating)
            .setThing(this.thing.clone());
    }
    toTTL(date): string {
        const date_s: string = date.toISOString();
        const ttl: string = `@prefix schema: <https://schema.org/> .
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
        @prefix foaf: <http://xmlns.com/foaf/0.1/>.

        <${this.id}> a schema:Review ;
        foaf:maker <${this.author ? this.author.webId : ''}>;
        schema:author ""^^xsd:string ;
        schema:datePublished "${date_s}"^^schema:dateTime ;
        schema:description """${Helper.escape4rdf(this.text)}"""^^xsd:string ;
        schema:name """${Helper.escape4rdf(this.summary)}"""^^xsd:string ;
        schema:reviewRating [
            a schema:Rating ;
            schema:bestRating "5"^^xsd:string ;
            schema:ratingValue "${this.rating}"^^xsd:string ;
            schema:worstRating "1"^^xsd:string
        ] ;
        schema:Thing [ \t ${this.thing.serialize()} ] .`;
        console.log(ttl);
        return ttl;
    }
}
