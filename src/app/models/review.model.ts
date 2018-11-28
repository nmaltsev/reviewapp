import { Property } from "./property.model";
import { SolidProfile } from "./solid-profile.model";

export class Review {
    summary: string;
    text: string;
    id: string;
    property: Property;
    author: SolidProfile;
    rating: number = 0;

    constructor (id:string, summary: string, text: string) {
        this.id = id;
        this.summary = summary;
        this.text = text;
    }
    setProperty(property: Property) {
        this.property = property;
        return this;
    }
    setAuthor(profile: SolidProfile) {
        this.author = profile;
        return this;
    }
    setRating(rating: number) {
        this.rating = rating;
        return this;
    }
}