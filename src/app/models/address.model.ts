export interface IAddress {
    locality?: string;
    countryName?: string;
    region?: string;
    street?: string;
}

export class Address implements IAddress {
    locality?: string;
    countryName?: string;
    region?: string;
    street?: string;
    constructor(countryName?: string, locality?:string, region?: string, street?: string) {
        this.countryName = countryName;
        this.locality = locality;
        this.region = region;
        this.street = street;
    }
    getLocality(): string {
        return this.locality + ', ' + this.countryName;
    }
}