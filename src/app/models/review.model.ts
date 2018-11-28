import { Property } from "./property.model";
import { SolidProfile } from "./solid-profile.model";

export class Review {
    summary: string;
    text: string;
    id: string;
    property: Property;
    author: SolidProfile;
    rating: number = 0;
    creationDate: Date;

    constructor (id:string, summary: string, text: string) {
        this.id = id;
        this.summary = summary;
        this.text = text;
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
}