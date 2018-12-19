import {AddressModel} from './address.model';
import {Helper} from '../../utils/helper';

export interface ThingInterface {
  additionalType: string; // e.g. schema:Hotel
  name: string;
  globalIdentifier?: string; // OpenStreetMap id
  address?: AddressModel;
  serialize(): string;
  clone();
}

export class Place implements ThingInterface {
  constructor(
    public additionalType: string,
    public name: string,
    public address?: AddressModel,
    public globalIdentifier?: string
  ) {}

  serialize(): string {
    const address = this.address.serialize();
    const ser =  `a ${this.additionalType} ;
    schema:name """${Helper.escape4rdf(this.name)}"""^^xsd:string;
    schema:identifier """${this.globalIdentifier}"""^^xsd:string;
    schema:address [${address}]`;
    return ser;
  }

  clone(): Place {
    return new Place(this.additionalType, this.name, this.address.clone(), this.globalIdentifier);
  }
}
