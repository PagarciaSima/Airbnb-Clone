import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {State} from "../../core/model/state.model";
import {BookedDatesDTOFromClient, BookedDatesDTOFromServer, BookedListing, CreateBooking} from "../model/booking.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";
import dayjs from "dayjs";

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private http = inject(HttpClient);

  private createBooking$: WritableSignal<State<boolean>> = signal(State.Builder<boolean>().forInit());
  createBookingSig = computed(() => this.createBooking$());

  private checkAvailability$: WritableSignal<State<Array<BookedDatesDTOFromClient>>> = signal(State.Builder<Array<BookedDatesDTOFromClient>>().forInit());
  checkAvailabilitySig = computed(() => this.checkAvailability$());


  private getBookedListing$: WritableSignal<State<Array<BookedListing>>> = signal(State.Builder<Array<BookedListing>>().forInit());
  getBookedListingSig = computed(() => this.getBookedListing$());

  private cancel$: WritableSignal<State<string>> = signal(State.Builder<string>().forInit());
  cancelSig = computed(() => this.cancel$());

  private getBookedListingForLandlord$: WritableSignal<State<Array<BookedListing>>>
    = signal(State.Builder<Array<BookedListing>>().forInit());
  getBookedListingForLandlordSig = computed(() => this.getBookedListingForLandlord$());

  /**
   * Creates a new booking by sending the booking data to the backend.
   * @param newBooking The booking data to create.
   * @returns void
   */
  create(newBooking: CreateBooking): void {
    this.http.post<boolean>(`${environment.API_URL}/booking/create`, newBooking)
      .subscribe({
        next: created => this.createBooking$.set(State.Builder<boolean>().forSuccess(created)),
        error: err => this.createBooking$.set(State.Builder<boolean>().forError(err)),
      });
  }

  /**
   * Checks the availability of a listing for booking by its public ID.
   * @param publicId The public ID of the listing.
   * @returns void
   */
  checkAvailability(publicId: string): void {
    const params = new HttpParams().set("listingPublicId", publicId);
    this.http.get<Array<BookedDatesDTOFromServer>>(`${environment.API_URL}/booking/check-availability`, {params})
      .pipe(
        map(this.mapDateToDayJS())
      ).subscribe({
      next: bookedDates =>
        this.checkAvailability$.set(State.Builder<Array<BookedDatesDTOFromClient>>().forSuccess(bookedDates)),
      error: err => this.checkAvailability$.set(State.Builder<Array<BookedDatesDTOFromClient>>().forError(err))
    })
  }



  /**
   * BookingService constructor.
   */
  constructor() {
  }

  /**
   * Maps an array of booked date DTOs from the server to client format using dayjs.
   * @private
   * @returns A function that converts an array of BookedDatesDTOFromServer to BookedDatesDTOFromClient.
   */
  private mapDateToDayJS = () => {
    return (bookedDates: Array<BookedDatesDTOFromServer>): Array<BookedDatesDTOFromClient> => {
      return bookedDates.map(reservedDate => this.convertDateToDayJS(reservedDate))
    }
  }

  /**
   * Converts a single booked date DTO from the server to client format using dayjs.
   * @param dto The booked date DTO from the server.
   * @returns The converted BookedDatesDTOFromClient object.
   * @private
   */
  private convertDateToDayJS<T extends BookedDatesDTOFromServer>(dto: T): BookedDatesDTOFromClient {
    return {
      ...dto,
      startDate: dayjs(dto.startDate),
      endDate: dayjs(dto.endDate),
    };
  }

  /**
   * Resets the state of the booking creation process.
   * @returns void
   */
  resetCreateBooking(): void {
    this.createBooking$.set(State.Builder<boolean>().forInit());
  }

  /**
   * Fetches all booked listings for the current user.
   * @returns void
   */
  getBookedListing(): void {
    this.http.get<Array<BookedListing>>(`${environment.API_URL}/booking/get-booked-listing`)
      .subscribe({
        next: bookedListings =>
          this.getBookedListing$.set(State.Builder<Array<BookedListing>>().forSuccess(bookedListings)),
        error: err => this.getBookedListing$.set(State.Builder<Array<BookedListing>>().forError(err)),
      });
  }

  /**
   * Cancels a booking by its public ID and listing public ID.
   * @param bookingPublicId The public ID of the booking to cancel.
   * @param listingPublicId The public ID of the listing associated with the booking.
   * @param byLandlord Whether the cancellation is performed by the landlord.
   * @returns void
   */
  cancel(bookingPublicId: string, listingPublicId: string, byLandlord: boolean): void {
    const params = new HttpParams()
      .set("bookingPublicId", bookingPublicId)
      .set("listingPublicId", listingPublicId)
      .set("byLandlord", byLandlord);
    this.http.delete<string>(`${environment.API_URL}/booking/cancel`, {params})
      .subscribe({
        next: canceledPublicId => this.cancel$.set(State.Builder<string>().forSuccess(canceledPublicId)),
        error: err => this.cancel$.set(State.Builder<string>().forError(err)),
      });
  }

  /**
   * Resets the state of the cancel operation.
   * @returns void
   */
  resetCancel(): void {
    this.cancel$.set(State.Builder<string>().forInit());
  }

  /**
   * Fetches all booked listings for the landlord.
   * @returns void
   */
  getBookedListingForLandlord(): void {
    this.http.get<Array<BookedListing>>(`${environment.API_URL}/booking/get-booked-listing-for-landlord`)
      .subscribe({
        next: bookedListings =>
          this.getBookedListingForLandlord$.set(State.Builder<Array<BookedListing>>().forSuccess(bookedListings)),
        error: err => this.getBookedListingForLandlord$.set(State.Builder<Array<BookedListing>>().forError(err)),
      });
  }

}