export class Helper {
  static escape4rdf(property: string): string {
    if (!property) { return ''; }
    return property.replace(/\"/g, '\'');
  }
}
