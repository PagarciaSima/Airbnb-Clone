import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {CardListing, Listing} from "../landlord/model/listing.model";
import {State} from "../core/model/state.model";
import {createPaginationOption, Page, Pagination} from "../core/model/request.model";
import {CategoryName} from "../layout/navbar/category/category.model";
import {environment} from "../../environments/environment";
import {Subject} from "rxjs";
import {Search} from "./search/search.model";

@Injectable({
  providedIn: 'root'
})
export class TenantListingService {

  http = inject(HttpClient);

  private getAllByCategory$: WritableSignal<State<Page<CardListing>>> = signal(State.Builder<Page<CardListing>>().forInit())
  getAllByCategorySig = computed(() => this.getAllByCategory$());

  private getOneByPublicId$: WritableSignal<State<Listing>> = signal(State.Builder<Listing>().forInit())
  getOneByPublicIdSig = computed(() => this.getOneByPublicId$());

  private search$: Subject<State<Page<CardListing>>> = new Subject<State<Page<CardListing>>>();
  search = this.search$.asObservable();


  /**
   * TenantListingService constructor.
   */
  constructor() { }

  /**
   * Fetches all listings by category with pagination.
   * @param pageRequest The pagination options.
   * @param category The category name to filter listings.
   * @returns void
   */
  getAllByCategory(pageRequest: Pagination, category: CategoryName): void {
    let params = createPaginationOption(pageRequest);
    params = params.set("category", category);
    this.http.get<Page<CardListing>>(`${environment.API_URL}/tenant-listing/get-all-by-category`, {params})
      .subscribe({
        next: (displayListingCards: Page<CardListing>) => {
          this.getAllByCategory$.set(State.Builder<Page<CardListing>>().forSuccess(displayListingCards));
        },
        error: (error: HttpErrorResponse) => {
          this.getAllByCategory$.set(State.Builder<Page<CardListing>>().forError(error));
        }
      });
  }

  /**
   * Resets the state of the getAllByCategory operation.
   * @returns void
   */
  resetGetAllCategory(): void {
    this.getAllByCategory$.set(State.Builder<Page<CardListing>>().forInit())
  }

  /**
   * Fetches a single listing by its public ID.
   * @param publicId The public ID of the listing to fetch.
   * @returns void
   */
  getOneByPublicId(publicId: string): void {
    const params = new HttpParams().set("publicId", publicId);
    this.http.get<Listing>(`${environment.API_URL}/tenant-listing/get-one`, {params})
      .subscribe({
        next: (listing: Listing) => {this.getOneByPublicId$.set(State.Builder<Listing>().forSuccess(listing))},
        error: (err: HttpErrorResponse) => {this.getOneByPublicId$.set(State.Builder<Listing>().forError(err))},
      });
  }

  /**
   * Resets the state of the getOneByPublicId operation.
   * @returns void
   */
  resetGetOneByPublicId(): void {
    this.getOneByPublicId$.set(State.Builder<Listing>().forInit())
  }

  /**
   * Searches for listings based on the provided search criteria and pagination options.
   * @param newSearch The search criteria.
   * @param pageRequest The pagination options.
   * @returns void
   */
  searchListing(newSearch: Search, pageRequest: Pagination): void {
    const params = createPaginationOption(pageRequest);
    this.http.post<Page<CardListing>>(`${environment.API_URL}/tenant-listing/search`, newSearch, {params})
      .subscribe({
        next: (displayListingCards: Page<CardListing>) => this.search$.next(State.Builder<Page<CardListing>>().forSuccess(displayListingCards)),
        error: (err: HttpErrorResponse) => this.search$.next(State.Builder<Page<CardListing>>().forError(err))
      })
  }
}