export interface OfficialAndCommon {
  common: string
  official: string
}

export interface CountryName extends OfficialAndCommon {
  native: {
    [languageCode: string]: OfficialAndCommon
  }
}

export interface Currency {
  name: string
  symbol: string
}

export interface IntlDirectDialingCode {
  root: string
  suffixes: string[]
}

export interface Demonyms {
  f: string
  m: string
}

export interface Country {
  name: CountryName
  tld: string[]
  cca2: string
  ccn3: string
  cca3: string
  cioc: string
  independent: boolean
  status: string
  currencies: { [currencyCode: string]: Currency }
  idd: IntlDirectDialingCode
  capital: string[]
  altSpellings: string[]
  region: string
  subregion: string
  languages: { [languageCode: string]: string }
  translations: { [languageCode: string]: OfficialAndCommon }
  latlng: [number, number]
  demonyms: { [languageCode: string]: Demonyms }
  landlocked: boolean
  borders: string[]
  area: number
  flag: string
  toString?: () => string;
}

// Helper to add toString to all countries after loading
export function addCountryToString(countries: Country[]): Country[] {
  return countries.map(c => ({
    ...c,
    toString: function() { return this.name.common; }
  }));
}

export type Countries = Country[]