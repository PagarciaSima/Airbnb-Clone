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

  @Output()
  datesChange: EventEmitter<BookedDatesDTOFromServer> = new EventEmitter<BookedDatesDTOFromServer>();

  @Output()
  stepValidityChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {
    this.restorePreviousDate();
  }

  onDateChange(newBookingDate: Date[]) {
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

  private validateDateSearch() {
    return this.searchDateRaw.length === 2
      && this.searchDateRaw[0] !== null
      && this.searchDateRaw[1] !== null
      && this.searchDateRaw[0].getDate() !== this.searchDateRaw[1].getDate()
  }

  private restorePreviousDate() {
    effect(() => {
      if (this.dates()) {
        this.searchDateRaw[0] = this.dates().startDate;
        this.searchDateRaw[1] = this.dates().endDate;
      }
    });
  }
}