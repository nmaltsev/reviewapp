import {Helper} from '../../utils/helper';

export class AddressModel {
  constructor(
    public country ?: string,
    public locality ?: string,
    public street ?: string,
    public countryGlobalId ?: string,
    public localityGlobalId ?: string,
    public geoCoordinates ?: string[],
  ) {}

  getLocality(): string {
    return this.locality + ', ' + this.country;
  }

  serialize(): string {
    const geo = this.geoCoordinates ? this.geoCoordinates.join(', ') : '';
    const str = `a schema:PostalAddress;
    schema:addressCountry [ a schema:Country;
        schema:name "${Helper.escape4rdf(this.country)}"^^xsd:string ;
        schema:identifier """${this.countryGlobalId}"""^^xsd:string ];
    schema:addressLocality [ a schema:AdministrativeArea ;
        schema:name "${Helper.escape4rdf(this.locality)}"^^xsd:string ;
        schema:identifier """${this.localityGlobalId}"""^^xsd:string ];
    schema:streetAddress "${Helper.escape4rdf(this.street)}"^^xsd:string`;
    return str;
  }

  clone(): AddressModel {
    return new AddressModel(this.country, this.locality, this.street,
      this.countryGlobalId, this.localityGlobalId, this.geoCoordinates
    );
  }
}
