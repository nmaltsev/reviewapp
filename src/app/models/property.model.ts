import { Address } from "./address.model";

export enum PropertyType {
    hotel,
    restaurant
}

export class Property {
    public type: PropertyType;
    public name: string;
    public address: Address;
    public osm_id: string; // OpenStreetMap Identifier

    constructor(
        type: PropertyType,
        name: string,
        address?: Address,
        osm_id?: string,
    ) {
        this.type = type;
        this.name = name;
        this.address = address;
        this.osm_id = osm_id;
    }

    clone(): Property {
        return new Property(this.type, this.name, this.address.clone(), this.osm_id);
    }
}
