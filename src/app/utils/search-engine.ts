import { Review } from "../models/sdm/review.model";

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
            review.thing ? review.thing.name : '',
            review.thing && review.thing.address ? review.thing && review.thing.address.country : '',
            review.thing && review.thing.address ? review.thing && review.thing.address.locality : '',
        ];

        return testValues.reduce((c: number, testValue: string) => {
            return c + this.numberOfLexemsInTestString(testValue.toLowerCase());
        }, 0);
    }
}