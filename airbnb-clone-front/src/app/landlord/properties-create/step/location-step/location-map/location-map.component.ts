
import {Component, effect, EventEmitter, inject, input, Output} from '@angular/core';
import {LeafletModule} from "@asymmetrik/ngx-leaflet";
import {FormsModule} from "@angular/forms";
import {AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent} from "primeng/autocomplete";
import {ToastService} from "../../../../../layout/toast.service";
import {OpenStreetMapProvider} from "leaflet-geosearch";
import L, {circle, latLng, polygon, tileLayer} from "leaflet";
import {filter} from "rxjs";
import { Country } from '../country-model';
import { CountryService } from '../country.service';

@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [
    LeafletModule,
    FormsModule,
    AutoCompleteModule
  ],
  templateUrl: './location-map.component.html',
  styleUrl: './location-map.component.scss'
})
export class LocationMapComponent {

  countryService = inject(CountryService);
  toastService = inject(ToastService);

  private map: L.Map | undefined;
  private provider: OpenStreetMapProvider | undefined;

  location = input.required<string>();
  placeholder = input<string>("Select your home country");

  currentLocation: Country | undefined;


  /**
   * Emits the selected location (country code) when the user selects a country.
   */
  @Output()
  locationChange: EventEmitter<string> = new EventEmitter<string>();


  /**
   * Formats the label for displaying a country in the autocomplete dropdown.
   * @param country The country to format.
   * @returns The formatted label string.
   */
  formatLabel = (country: Country): string => country.flag + "   " + country.name.common;

  options = {
    layers: [
      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom: 18, attribution: "..."}),
    ],
    zoom: 5,
    center: latLng(46.87996, -121.726909)
  }

  layersControl = {
    baseLayers: {
      "Open Street Map": tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "..."
      }),
    },
    overlays: {
      "Big Circle": circle([46.95, -122], {radius: 5000}),
      "Big square": polygon([[46.8, -121.55], [46.8, -121.55], [46.8, -121.55], [46.8, -121.55]])
    }
  }

  countries: Array<Country> = [];
  filteredCountries: Array<Country> = [];



  /**
   * LocationMapComponent constructor. Initializes the listener for location changes.
   */
  constructor() {
    this.listenToLocation();
  }

  /**
   * Called when the map is ready. Stores the map instance and configures the search control.
   * @param map The Leaflet map instance.
   * @returns void
   */
  onMapReady(map: L.Map): void {
    this.map = map;
    this.configSearchControl();
  }

  /**
   * Configures the OpenStreetMap search provider for geocoding.
   * @private
   * @returns void
   */
  private configSearchControl(): void {
    this.provider = new OpenStreetMapProvider();
  }

  /**
   * Handles the selection of a new location from the autocomplete dropdown.
   * @param newEvent The autocomplete select event containing the selected country.
   * @returns void
   */
  onLocationChange(newEvent: AutoCompleteSelectEvent): void {
    const newCountry = newEvent.value as Country;
    this.locationChange.emit(newCountry.cca3);
  }

  /**
   * Listens for changes to the list of countries and updates the map location accordingly.
   * @private
   * @returns void
   */
  private listenToLocation(): void {
    effect(() => {
      const countriesState = this.countryService.countries();
      if (countriesState.status === "OK" && countriesState.value) {
        this.countries = countriesState.value;
        this.filteredCountries = countriesState.value;
        this.changeMapLocation(this.location())
      } else if (countriesState.status === "ERROR") {
        this.toastService.send({
          severity: "error", summary: "Error",
          detail: "Something went wrong when loading countries on change location"
        });
      }
    });
  }

  /**
   * Changes the map view to the selected country's location.
   * @param term The country code (cca3) to locate on the map.
   * @private
   * @returns void
   */
  private changeMapLocation(term: string): void {
    this.currentLocation = this.countries.find(country => country.cca3 === term);
    if (this.currentLocation) {
      this.provider!.search({query: this.currentLocation.name.common})
        .then((results) => {
          if (results && results.length > 0) {
            const firstResult = results[0];
            this.map!.setView(new L.LatLng(firstResult.y, firstResult.x), 13);
            L.marker([firstResult.y, firstResult.x])
              .addTo(this.map!)
              .bindPopup(firstResult.label)
              .openPopup();
          }
        })
    }
  }

  /**
   * Filters the list of countries based on the autocomplete input.
   * @param newCompleteEvent The autocomplete complete event containing the query string.
   * @returns void
   */
  search(newCompleteEvent: AutoCompleteCompleteEvent): void {
    this.filteredCountries =
      this.countries.filter(country => country.name.common.toLowerCase().startsWith(newCompleteEvent.query))
  }

  /**
   * Handles changes to the input field and resets the current location if the input is empty.
   * @param value The new input value.
   * @returns void
   */
  onInputChange(value: any): void {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      this.currentLocation = undefined;
      this.filteredCountries = this.countries;
      this.locationChange.emit('');
    }
  }

  protected readonly filter = filter;
}