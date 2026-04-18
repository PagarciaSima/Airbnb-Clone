import {Component, effect, inject, input, InputSignal, OnDestroy, OnInit} from '@angular/core';
import {Listing} from "../../landlord/model/listing.model";
import {BookingService} from "../service/booking.service";
import {ToastService} from "../../layout/toast.service";
import {AuthService} from "../../core/auth/auth.service";
import {Router} from "@angular/router";
import dayjs from "dayjs";
import {BookedDatesDTOFromClient, CreateBooking} from "../model/booking.model";
import {CurrencyPipe} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {FormsModule} from "@angular/forms";
import {MessageModule} from "primeng/message";

@Component({
  selector: 'app-book-date',
  standalone: true,
  imports: [
    CurrencyPipe,
    CalendarModule,
    FormsModule,
    MessageModule
  ],
  templateUrl: './book-date.component.html',
  styleUrl: './book-date.component.scss'
})
export class BookDateComponent implements OnInit, OnDestroy {

  listing: InputSignal<Listing> = input.required<Listing>();
  listingPublicId: InputSignal<string> = input.required<string>();

  bookingService = inject(BookingService);
  toastService = inject(ToastService);
  authService = inject(AuthService);
  router = inject(Router);

  bookingDates = new Array<Date>();
  totalPrice = 0;
  minDate = new Date();
  bookedDates = new Array<Date>();


  /**
   * BookDateComponent constructor. Initializes listeners for checking available dates and booking creation.
   */
  constructor() {
    this.listenToCheckAvailableDate();
    this.listenToCreateBooking()
  }


  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Resets the booking creation state.
   * @returns void
   */
  ngOnDestroy(): void {
    this.bookingService.resetCreateBooking();
  }


  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Checks the availability of the listing for booking.
   * @returns void
   */
  ngOnInit(): void {
    this.bookingService.checkAvailability(this.listingPublicId());
  }

  /**
   * Handles changes to the selected booking dates and calculates the total price.
   * @param newBookingDates The new array of selected booking dates.
   * @returns void
   */
  onDateChange(newBookingDates: Array<Date>): void {
    this.bookingDates = newBookingDates;
    if (this.validateMakeBooking()) {
      const startBookingDateDayJS = dayjs(newBookingDates[0]);
      const endBookingDateDayJS = dayjs(newBookingDates[1]);
      this.totalPrice = endBookingDateDayJS.diff(startBookingDateDayJS, "days") * this.listing().price.value;
    } else {
      this.totalPrice = 0;
    }
  }

  /**
   * Validates if a booking can be made based on the selected dates and authentication state.
   * @returns True if booking is valid, false otherwise.
   */
  validateMakeBooking(): boolean {
    return this.bookingDates.length === 2
      && this.bookingDates[0] !== null
      && this.bookingDates[1] !== null
      && this.bookingDates[0].getDate() !== this.bookingDates[1].getDate()
      && this.authService.isAuthenticated();
  }

  /**
   * Creates a new booking with the selected dates and listing.
   * @returns void
   */
  onNewBooking(): void {
    const newBooking: CreateBooking = {
      listingPublicId: this.listingPublicId(),
      startDate: this.bookingDates[0],
      endDate: this.bookingDates[1],
    }
    this.bookingService.create(newBooking);
  }

  /**
   * Listens for changes in the check availability state and updates the booked dates.
   * @private
   * @returns void
   */
  private listenToCheckAvailableDate(): void {
    effect(() => {
      const checkAvailabilityState = this.bookingService.checkAvailabilitySig();
      if (checkAvailabilityState.status === "OK") {
        this.bookedDates = this.mapBookedDatesToDate(checkAvailabilityState.value!);
      } else if (checkAvailabilityState.status === "ERROR") {
        this.toastService.send({
          severity: "error", detail: "Error when fetching the not available dates", summary: "Error",
        });
      }
    });
  }

  /**
   * Maps an array of booked date DTOs to an array of Date objects.
   * @param bookedDatesDTOFromClients The array of booked date DTOs from the client.
   * @returns An array of booked Date objects.
   * @private
   */
  private mapBookedDatesToDate(bookedDatesDTOFromClients: Array<BookedDatesDTOFromClient>): Array<Date> {
    const bookedDates = new Array<Date>();
    for (let bookedDate of bookedDatesDTOFromClients) {
      bookedDates.push(...this.getDatesInRange(bookedDate));
    }
    return bookedDates;
  }

  /**
   * Returns all dates in the range between the start and end date of a booking.
   * @param bookedDate The booked date DTO containing the range.
   * @returns An array of Date objects in the range.
   * @private
   */
  private getDatesInRange(bookedDate: BookedDatesDTOFromClient): Array<Date> {
    const dates = new Array<Date>();

    let currentDate = bookedDate.startDate;
    while (currentDate <= bookedDate.endDate) {
      dates.push(currentDate.toDate());
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  }

  /**
   * Listens for changes in the booking creation state and handles success or error notifications.
   * @private
   * @returns void
   */
  private listenToCreateBooking(): void {
    effect(() => {
      const createBookingState = this.bookingService.createBookingSig();
      if (createBookingState.status === "OK") {
        this.toastService.send({
          severity: "success", detail: "Booking created successfully",
        });
        this.router.navigate(['/booking']);
      } else if (createBookingState.status === "ERROR") {
        this.toastService.send({
          severity: "error", detail: "Booking created failed",
        });
      }
    });
  }
}