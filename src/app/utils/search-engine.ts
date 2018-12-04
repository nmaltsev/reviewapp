import { Review } from "../models/review.model";

export class Search {
    private lexems:string[];

    constructor(query: string) {
        this.lexems = query.split(',').map((s:string) => s.trim().toLowerCase());
    }

    private numberOfLexemsInTestString(s: string):number {
        let c:number = 0;
        let i:number = this.lexems.length;

        while (i-- > 0) {
            if (s.indexOf(this.lexems[i]) > -1) c++;
        }

        return c;
    }
    
    compare(review: Review): number {
        let testValues: string[] = [
            review.author.fn,
            review.summary,
            review.text,
            review.property ? review.property.name : '',
            review.property && review.property.address ? review.property && review.property.address.countryName : '',
            review.property && review.property.address ? review.property && review.property.address.locality : '',
        ];

        return testValues.reduce((c: number, testValue: string) => {
            return c + this.numberOfLexemsInTestString(testValue.toLowerCase());
        }, 0);
    }
}