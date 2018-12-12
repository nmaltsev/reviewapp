
export interface IProperties {
  osm_id: string;
  osm_value: string;
  name: string;
  country: string;
  state?: string;
  city?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  osm_type?: string;
  extent: number[];
  osm_key: string;
}

export interface IGeometry {
  coordinates: number[];
  type: string;
}

export interface PhotonInterface {
  properties: IProperties;
  geometry: IGeometry;
  type: string;
}

export interface IPhotonResponse {
  features: PhotonInterface[];
  type: string;
}
