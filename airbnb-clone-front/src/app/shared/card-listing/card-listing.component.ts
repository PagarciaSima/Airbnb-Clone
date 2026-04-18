import {Component, effect, EventEmitter, inject, input, Output} from '@angular/core';
import { CardListing } from "../../landlord/model/listing.model";
import {BookedListing} from "../../tenant/model/booking.model";
import {Router} from "@angular/router";
import { CategoryService } from "../../layout/navbar/category/category.service";
import {CountryService} from "../../landlord/properties-create/step/location-step/country.service";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-card-listing',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    FaIconComponent
  ],
  templateUrl: './card-listing.component.html',
  styleUrl: './card-listing.component.scss'
})
export class CardListingComponent {

  listing = input.required<CardListing | BookedListing>();
  cardMode = input<"landlord" | "booking">();

  @Output()
  deleteListing = new EventEmitter<CardListing>();
  @Output()
  cancelBooking = new EventEmitter<BookedListing>();

  bookingListing: BookedListing | undefined;
  cardListing: CardListing | undefined;

  router = inject(Router);
  categoryService = inject(CategoryService);
  countryService = inject(CountryService);



  /**
   * CardListingComponent constructor. Initializes listeners for listing and card mode changes.
   */
  constructor() {
    this.listenToListing();
    this.listenToCardMode();
  }

  /**
   * Listens for changes to the listing input and updates the location with country information.
   * @private
   * @returns void
   */
  private listenToListing(): void {
    effect(() => {
      const listing = this.listing();
      this.countryService.getCountryByCode(listing.location)
        .subscribe({
          next: country => {
            if (listing) {
              this.listing().location = country.region + ", " + country.name.common
            }
          }
        })
    });
  }

  /**
   * Listens for changes to the card mode input and updates the card/booking listing references.
   * @private
   * @returns void
   */
  private listenToCardMode(): void {
    effect(() => {
      const cardMode = this.cardMode();
      if (cardMode && cardMode === "booking") {
        this.bookingListing = this.listing() as BookedListing
      } else {
        this.cardListing = this.listing() as CardListing;
      }
    });
  }


  /**
   * Emits an event to delete the given card listing.
   * @param displayCardListingDTO The card listing to delete.
   * @returns void
   */
  onDeleteListing(displayCardListingDTO: CardListing): void {
    this.deleteListing.emit(displayCardListingDTO);
  }


  /**
   * Emits an event to cancel the given booking.
   * @param bookedListing The booked listing to cancel.
   * @returns void
   */
  onCancelBooking(bookedListing: BookedListing): void {
    this.cancelBooking.emit(bookedListing);
  }


  /**
   * Navigates to the listing details page for the given public ID.
   * @param publicId The public ID of the listing.
   * @returns void
   */
  onClickCard(publicId: string): void {
    this.router.navigate(['listing'],
      {queryParams: {id: publicId}});
  }

}