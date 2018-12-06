import { Property } from './property.model';
import { SolidProfile } from './solid-profile.model';

export class Review {
    summary: string;
    text: string;
    id: string;
    property: Property;
    author: SolidProfile;
    rating = 0;
    creationDate: Date;

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
    clone(id: string): Review {
        return new Review(id || this.id)
            .setContent(this.summary, this.text)
            .setAuthor(this.author)
            .setCreation(this.creationDate ? new Date(this.creationDate) : new Date())
            .setRating(this.rating)
            .setProperty(this.property.clone());
    }
}