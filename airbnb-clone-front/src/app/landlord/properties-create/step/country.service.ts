import { HttpClient } from "@angular/common/http";
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';

import { catchError, map, Observable, of, shareReplay, tap } from "rxjs";
import { State } from '../../../core/model/state.model';
import { Country } from './location-step/country-model';
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  http = inject(HttpClient);

  private countries$: WritableSignal<State<Array<Country>>> = signal(State.Builder<Array<Country>>().forInit());
  countries = computed(() => this.countries$());

  private fetchCountry$ = new Observable<Array<Country>>();

  constructor() {
    this.initFetchGetAllCountries();
    this.fetchCountry$.subscribe();
  }

  initFetchGetAllCountries(): void {
    this.fetchCountry$ = this.http.get<Array<Country>>(`${environment.BACKEND_URL}/assets/countries.json`)
      .pipe(
        tap(countries =>
          this.countries$.set(State.Builder<Array<Country>>().forSuccess(countries))),
        catchError(err => {
          this.countries$.set(State.Builder<Array<Country>>().forError(err));
          return of(err);
        }),
        shareReplay(1)
      );
  }

  public getCountryByCode(code: string): Observable<Country> {
    return this.fetchCountry$.pipe(
      map(countries => countries.filter(country => country.cca3 === code)),
      map(countries => countries[0])
    );
  }
}