import { Address } from "./address.model";

export enum PropertyType {
    hotel,
    restaurant
};

export class Property {
    public type:PropertyType;
    public name:string;
    public address:Address;

    constructor(
        type: PropertyType, 
        name: string, 
        address?: Address
    ) {
        this.type = type;
        this.name = name;
        this.address = address;
    }

    clone(): Property {
        return new Property(this.type, this.name, this.address.clone());
    }
}