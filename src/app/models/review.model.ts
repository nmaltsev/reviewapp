import { Property } from './property.model';
import { SolidProfile } from './solid-profile.model';
import { ITerm }  from './rdf.model';

export class Review {
    summary: string;
    text: string;
    id: string;
    property: Property;
    author: SolidProfile;
    rating = 0;
    creationDate: Date;
    subject: ITerm;

    constructor (id: string) {
        this.id = id;
    }
    setContent(summary: string, text: string): Review {
        this.summary = summary;
        this.text = text;
        return this;
    }
    setProperty(property: Property): Review {
        this.property = property;
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
            .setProperty(this.property.clone());
    }
    toTTL(date): string {
        const date_s:string = date.toISOString();
        const ttl:string = `@prefix schema: <https://schema.org/> .
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
        @prefix foaf: <http://xmlns.com/foaf/0.1/>.
    
        <${this.id}> a schema:Review ;
        foaf:maker <${this.author ? this.author.webId : ''}>;
        schema:author ""^^xsd:string ;
        schema:datePublished "${date_s}"^^schema:dateTime ;
        schema:description """${this.escape4rdf(this.text)}"""^^xsd:string ;
        schema:name """${this.escape4rdf(this.summary)}"""^^xsd:string ;
        schema:reviewRating [
            a schema:Rating ;
            schema:bestRating "5"^^xsd:string ;
            schema:ratingValue "${this.rating}"^^xsd:string ;
            schema:worstRating "1"^^xsd:string
        ] ;
        schema:hotel [
            a schema:Hotel ;
            schema:name """${this.escape4rdf(this.property.name)}"""^^xsd:string ;
            schema:identifier """${this.property.osm_id}"""^^xsd:string;
            schema:address [
            a schema:PostalAddress ;
            schema:addressCountry "${this.escape4rdf(this.property.address.countryName)}"^^xsd:string ;
            schema:addressLocality "${this.escape4rdf(this.property.address.locality)}"^^xsd:string ;
            schema:addressRegion "${this.property.address.region}"^^xsd:string ;
            schema:postalCode ""^^xsd:string ;
            schema:streetAddress "${this.property.address.street}"^^xsd:string
            ] ;
        ] .`;

        return ttl;
    }
    private escape4rdf(property: string): string {
        return property.replace(/\"/g, '\'');
    }
}