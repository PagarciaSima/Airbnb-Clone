import {Component, effect, inject, OnDestroy, OnInit} from '@angular/core';
import {BookingService} from "../service/booking.service";
import {ToastService} from "../../layout/toast.service";
import {BookedListing} from "../model/booking.model";
import {CardListingComponent} from "../../shared/card-listing/card-listing.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-booked-listing',
  standalone: true,
  imports: [
    CardListingComponent,
    FaIconComponent
  ],
  templateUrl: './booked-listing.component.html',
  styleUrl: './booked-listing.component.scss'
})
export class BookedListingComponent implements OnInit, OnDestroy {

  bookingService = inject(BookingService);
  toastService = inject(ToastService);
  bookedListings = new Array<BookedListing>();

  loading = false;


  /**
   * BookedListingComponent constructor. Initializes listeners for fetching and canceling bookings.
   */
  constructor() {
    this.listenFetchBooking();
    this.listenCancelBooking()
  }


  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Resets the cancel state in the booking service.
   * @returns void
   */
  ngOnDestroy(): void {
    this.bookingService.resetCancel();
  }


  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Fetches the user's booked listings.
   * @returns void
   */
  ngOnInit(): void {
    this.fetchBooking();
  }


  /**
   * Fetches the user's booked listings and sets the loading state.
   * @private
   * @returns void
   */
  private fetchBooking(): void {
    this.loading = true;
    this.bookingService.getBookedListing();
  }


  /**
   * Cancels a booking for the given booked listing.
   * @param bookedListing The booked listing to cancel.
   * @returns void
   */
  onCancelBooking(bookedListing: BookedListing): void {
    bookedListing.loading = true;
    this.bookingService.cancel(bookedListing.bookingPublicId, bookedListing.listingPublicId, false);
  }

  /**
   * Listens for changes in the fetch booking state and updates the booked listings.
   * @private
   * @returns void
   */
  private listenFetchBooking(): void {
    effect(() => {
      const bookedListingsState = this.bookingService.getBookedListingSig();
      if (bookedListingsState.status === "OK") {
        this.loading = false;
        this.bookedListings = bookedListingsState.value!;
      } else if(bookedListingsState.status === "ERROR") {
        this.loading = false;
        this.toastService.send({
          severity: "error", summary: "Error when fetching the listing",
        });
      }
    });
  }

  /**
   * Listens for changes in the cancel booking state and updates the UI accordingly.
   * @private
   * @returns void
   */
  private listenCancelBooking(): void {
    effect(() => {
      const cancelState = this.bookingService.cancelSig();
      if (cancelState.status === "OK") {
        const listingToDeleteIndex = this.bookedListings.findIndex(
          listing => listing.bookingPublicId === cancelState.value
        );
        this.bookedListings.splice(listingToDeleteIndex, 1);
        this.toastService.send({
          severity: "success", summary: "Successfully cancelled booking",
        });
      } else if (cancelState.status === "ERROR") {
        const listingToDeleteIndex = this.bookedListings.findIndex(
          listing => listing.bookingPublicId === cancelState.value
        );
        this.bookedListings[listingToDeleteIndex].loading = false;
        this.toastService.send({
          severity: "error", summary: "Error when cancel your booking",
        })
      }
    });
  }
}