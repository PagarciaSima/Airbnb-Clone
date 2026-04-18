import {Component, EventEmitter, input, Output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {InfoStepControlComponent} from "./info-step-control/info-step-control.component";
import {NewListingInfo} from "../../../model/listing.model";

export type Control = "GUESTS" | "BEDROOMS" | "BEDS" | "BATHS"

@Component({
  selector: 'app-info-step',
  standalone: true,
  imports: [FormsModule, ButtonModule, FontAwesomeModule, InfoStepControlComponent],
  templateUrl: './info-step.component.html',
  styleUrl: './info-step.component.scss'
})
export class InfoStepComponent {

  infos = input.required<NewListingInfo>();


  /**
   * Emits the updated info when any of the controls change.
   */
  @Output()
  infoChange: EventEmitter<NewListingInfo> = new EventEmitter<NewListingInfo>();


  /**
   * Emits the validity state of the step (true if valid, false otherwise).
   */
  @Output()
  stepValidityChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Handles changes to the info controls and emits the updated info and validity state.
   * @param newValue The new value for the control.
   * @param valueType The type of control being changed (GUESTS, BEDROOMS, BEDS, BATHS).
   * @returns void
   */
  onInfoChange(newValue: number, valueType: Control): void {
    switch (valueType) {
      case "BATHS":
        this.infos().baths = {value: newValue}
        break;
      case "BEDROOMS":
        this.infos().bedrooms = {value: newValue}
        break;
      case "BEDS":
        this.infos().beds = {value: newValue}
        break;
      case "GUESTS":
        this.infos().guests = {value: newValue}
        break
    }

    this.infoChange.emit(this.infos());
    this.stepValidityChange.emit(this.validationRules());
  }

  /**
   * Validates the info step according to the business rules.
   * @returns True if the step is valid, false otherwise.
   */
  validationRules(): boolean {
    return this.infos().guests.value >= 1;
  }

}