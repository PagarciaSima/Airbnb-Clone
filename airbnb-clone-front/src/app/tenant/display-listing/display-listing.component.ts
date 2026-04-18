import {Component, effect, inject, OnDestroy, OnInit} from '@angular/core';
import {TenantListingService} from "../tenant-listing.service";
import {ActivatedRoute} from "@angular/router";
import {ToastService} from "../../layout/toast.service";
import {CategoryService} from "../../layout/navbar/category/category.service";
import {CountryService} from "../../landlord/properties-create/step/location-step/country.service";
import {DisplayPicture, Listing} from "../../landlord/model/listing.model";
import {Category} from "../../layout/navbar/category/category.model";
import {map} from "rxjs";
import {NgClass} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {AvatarComponent} from "../../layout/navbar/avatar/avatar.component";
import { State } from '../../core/model/state.model';
import { Country } from '../../landlord/properties-create/step/location-step/country-model';
import { BookDateComponent } from '../book-date/book-date.component';

@Component({
  selector: 'app-display-listing',
  standalone: true,
  imports: [
    NgClass,
    FaIconComponent,
    AvatarComponent,
    BookDateComponent
  ],
  templateUrl: './display-listing.component.html',
  styleUrl: './display-listing.component.scss'
})
export class DisplayListingComponent implements OnInit, OnDestroy {

  tenantListingService = inject(TenantListingService);
  activatedRoute = inject(ActivatedRoute);
  toastService = inject(ToastService);
  categoryService = inject(CategoryService);
  countryService = inject(CountryService);

  listing: Listing | undefined;
  category: Category | undefined;
  currentPublicId = "";

  loading = true;



  /**
   * DisplayListingComponent constructor. Initializes the listener for fetching a listing by public ID.
   */
  constructor() {
    this.listenToFetchListing();
  }


  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Resets the state for fetching a listing by public ID.
   * @returns void
   */
  ngOnDestroy(): void {
    this.tenantListingService.resetGetOneByPublicId();
  }


  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Extracts the listing public ID from the route and fetches the listing.
   * @returns void
   */
  ngOnInit(): void {
    this.extractIdParamFromRouter();
  }

  /**
   * Extracts the listing public ID from the route query parameters and fetches the listing.
   * @private
   * @returns void
   */
  private extractIdParamFromRouter(): void {
    this.activatedRoute.queryParams.pipe(
      map(params => params['id'])
    ).subscribe({
      next: (publicId: string) => this.fetchListing(publicId)
    })
  }

  /**
   * Fetches the listing by its public ID and sets the loading state.
   * @param publicId The public ID of the listing to fetch.
   * @private
   * @returns void
   */
  private fetchListing(publicId: string): void {
    this.loading = true;
    this.currentPublicId = publicId;
    this.tenantListingService.getOneByPublicId(publicId);
  }

  /**
   * Listens for changes in the fetch listing state and updates the listing, category, and location.
   * @private
   * @returns void
   */
  private listenToFetchListing(): void {
    effect(() => {
      const listingByPublicIdState: State<Listing> = this.tenantListingService.getOneByPublicIdSig();
      if (listingByPublicIdState.status === "OK") {
        this.loading = false;
        this.listing = listingByPublicIdState.value;
        if (this.listing) {
          this.listing.pictures = this.putCoverPictureFirst(this.listing.pictures);
          this.category = this.categoryService.getCategoryByTechnicalName(this.listing.category);
          this.countryService.getCountryByCode(this.listing.location)
            .subscribe({
              next: (country: Country) => {
                if (this.listing) {
                  this.listing.location = country.region + ", " + country.name.common;
                }
              }
            });
        }
      } else if (listingByPublicIdState.status === "ERROR") {
        this.loading = false;
        this.toastService.send({
          severity: "error", detail: "Error when fetching the listing",
        })
      }
    });
  }

  /**
   * Moves the cover picture to the first position in the pictures array.
   * @param pictures The array of display pictures.
   * @returns The reordered array with the cover picture first.
   * @private
   */
  private putCoverPictureFirst(pictures: Array<DisplayPicture>): Array<DisplayPicture> {
    const coverIndex = pictures.findIndex((picture: DisplayPicture) => picture.isCover);
    if (coverIndex) {
      const cover = pictures[coverIndex];
      pictures.splice(coverIndex, 1);
      pictures.unshift(cover);
    }
    return pictures;
  }
}