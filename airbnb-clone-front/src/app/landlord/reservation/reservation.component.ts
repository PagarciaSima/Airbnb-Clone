import {Component, effect, inject, OnDestroy, OnInit} from '@angular/core';
import {ToastService} from "../../layout/toast.service";
import {BookingService} from "../../tenant/service/booking.service";
import {BookedListing} from "../../tenant/model/booking.model";
import {CardListingComponent} from "../../shared/card-listing/card-listing.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    CardListingComponent,
    FaIconComponent
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})
export class ReservationComponent implements OnInit, OnDestroy {

  bookingService = inject(BookingService);
  toastService = inject(ToastService);

  reservationListings = new Array<BookedListing>();

  loading = false;



  /**
   * ReservationComponent constructor. Initializes listeners for fetching and canceling reservations.
   */
  constructor() {
    this.listenToFetchReservation();
    this.listenToCancelReservation();
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
   * Fetches the reservation listings for the landlord.
   * @returns void
   */
  ngOnInit(): void {
    this.fetchReservation();
  }


  /**
   * Fetches the reservation listings for the landlord and sets the loading state.
   * @private
   * @returns void
   */
  private fetchReservation(): void {
    this.loading = true;
    this.bookingService.getBookedListingForLandlord();
  }

  /**
   * Listens for changes in the cancel reservation state and updates the UI accordingly.
   * @private
   * @returns void
   */
  private listenToCancelReservation(): void {
    effect(() => {
      const cancelState = this.bookingService.cancelSig();
      if (cancelState.status === "OK") {
        const listingToDeleteIndex = this.reservationListings.findIndex(listing => listing.bookingPublicId === cancelState.value);
        this.reservationListings.splice(listingToDeleteIndex, 1);
        this.toastService.send({
          severity: "success", summary: "Successfully cancelled reservation",
        });
      } else if (cancelState.status === "ERROR") {
        const listingToDeleteIndex = this.reservationListings.findIndex(listing => listing.bookingPublicId === cancelState.value);
        this.reservationListings[listingToDeleteIndex].loading = false;
        this.toastService.send({
          severity: "error", summary: "Error when canceling reservation",
        });
      }
    });
  }

  /**
   * Listens for changes in the fetch reservation state and updates the reservation listings.
   * @private
   * @returns void
   */
  private listenToFetchReservation(): void {
    effect(() => {
      const reservedListingsState = this.bookingService.getBookedListingForLandlordSig();
      if (reservedListingsState.status === "OK") {
        this.loading = false;
        this.reservationListings = reservedListingsState.value!;
      } else if(reservedListingsState.status === "ERROR") {
        this.loading = false;
        this.toastService.send({
          severity: "error", summary: "Error when fetching the reservation",
        });
      }
    });
  }

  /**
   * Cancels a reservation for the given booked listing.
   * @param reservation The booked listing to cancel.
   * @returns void
   */
  onCancelReservation(reservation: BookedListing): void {
    reservation.loading = true;
    this.bookingService.cancel(reservation.bookingPublicId, reservation.listingPublicId, true);
  }
}