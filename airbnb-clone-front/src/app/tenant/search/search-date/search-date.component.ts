import { Component, effect, EventEmitter, input, InputSignal, Output } from '@angular/core';
import { BookedDatesDTOFromServer } from "../../model/booking.model";
import { CalendarModule } from "primeng/calendar";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-search-date',
  standalone: true,
  imports: [
    CalendarModule,
    FormsModule
  ],
  templateUrl: './search-date.component.html',
  styleUrl: './search-date.component.scss'
})
export class SearchDateComponent {

  dates: InputSignal<BookedDatesDTOFromServer> = input.required<BookedDatesDTOFromServer>();
  searchDateRaw: Date[] = new Array<Date>();
  minDate: Date = new Date();


  /**
   * Emits the updated booking dates when the date selection changes.
   */
  @Output()
  datesChange: EventEmitter<BookedDatesDTOFromServer> = new EventEmitter<BookedDatesDTOFromServer>();


  /**
   * Emits the validity state of the step (true if valid, false otherwise).
   */
  @Output()
  stepValidityChange: EventEmitter<boolean> = new EventEmitter<boolean>();


  /**
   * SearchDateComponent constructor. Restores the previous date selection if available.
   */
  constructor() {
    this.restorePreviousDate();
  }

  /**
   * Handles changes to the date selection and emits the new dates if valid.
   * @param newBookingDate The new array of selected dates.
   * @returns void
   */
  onDateChange(newBookingDate: Date[]): void {
    this.searchDateRaw = newBookingDate;
    const isDateValid = this.validateDateSearch();
    this.stepValidityChange.emit(isDateValid);

    if (isDateValid) {
      const searchDate: BookedDatesDTOFromServer = {
        startDate: this.searchDateRaw[0],
        endDate: this.searchDateRaw[1]
      }
      this.datesChange.emit(searchDate);
    }
  }

  /**
   * Validates the selected dates for the search step.
   * @private
   * @returns True if the date selection is valid, false otherwise.
   */
  private validateDateSearch(): boolean {
    return this.searchDateRaw.length === 2
      && this.searchDateRaw[0] !== null
      && this.searchDateRaw[1] !== null
      && this.searchDateRaw[0].getDate() !== this.searchDateRaw[1].getDate()
  }

  /**
   * Restores the previously selected dates from the input signal if available.
   * @private
   * @returns void
   */
  private restorePreviousDate(): void {
    effect(() => {
      if (this.dates()) {
        this.searchDateRaw[0] = this.dates().startDate;
        this.searchDateRaw[1] = this.dates().endDate;
      }
    });
  }
}