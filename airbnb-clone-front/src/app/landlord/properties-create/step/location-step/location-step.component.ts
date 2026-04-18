import {Component, EventEmitter, input, Output} from '@angular/core';
import {LocationMapComponent} from "./location-map/location-map.component";

@Component({
  selector: 'app-location-step',
  standalone: true,
  imports: [
    LocationMapComponent
  ],
  templateUrl: './location-step.component.html',
  styleUrls: ['./location-step.component.scss']
})
export class LocationStepComponent {

  location = input.required<string>();


  /**
   * Emits the selected location (country code) when the user selects a location.
   */
  @Output()
  locationChange: EventEmitter<string> = new EventEmitter<string>();


  /**
   * Emits the validity state of the step (true if valid, false otherwise).
   */
  @Output()
  stepValidityChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Handles the selection of a new location and emits the changes.
   * @param location The newly selected location (country code).
   * @returns void
   */
  onLocationChange(location: string): void {
    this.locationChange.emit(location);
    this.stepValidityChange.emit(true);
  }
}