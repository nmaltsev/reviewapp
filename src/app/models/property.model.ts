import { Address } from "./address.model";

export enum PropertyType {
    hotel,
    restaurant
};

export class Property {
    public type:PropertyType;
    public name:string;
    public adress:Address;

    constructor(
        type: PropertyType, 
        name: string, 
        adress?: Address
    ) {
        this.type = type;
        this.name = name;
        this.adress = adress;
    }
}