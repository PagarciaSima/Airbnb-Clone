import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '../../core/auth/auth.service';
import { State } from '../../core/model/state.model';
import { CategoryName } from '../../layout/navbar/category/category.model';
import { ToastService } from '../../layout/toast.service';
import { LandlordListingService } from '../landlor-listing.service';
import { PriceVO } from '../model/listing-vo.model';
import { NewListing, CreatedListing, NewListingInfo, Description } from '../model/listing.model';
import { NewListingPicture } from '../model/picture.model';
import { Step } from './step.model';
import { CategoryStepComponent } from './step/category-step/category-step.component';
import { FooterStepComponent } from '../../shared/footer-step/footer-step.component';
import { LocationStepComponent } from './step/location-step/location-step.component';
import { InfoStepComponent } from './step/info-step/info-step.component';
import { PictureStepComponent } from './step/picture-step/picture-step.component';
import { DescriptionStepComponent } from './step/description-step/description-step.component';
import { PriceStepComponent } from './step/price-step/price-step.component';

@Component({
  selector: 'app-properties-create',
  standalone: true,
  imports: [
    CategoryStepComponent,
    FooterStepComponent,
    LocationStepComponent,
    InfoStepComponent,
    PictureStepComponent,
    DescriptionStepComponent,
    PriceStepComponent
  ],
  templateUrl: './properties-create.component.html',
  styleUrl: './properties-create.component.scss'
})
export class PropertiesCreateComponent {
  CATEGORY = "category";
  LOCATION = "location";
  INFO = "info";
  PHOTOS = "photos";
  DESCRIPTION = "description";
  PRICE = "price";

  dialogDynamicRef = inject(DynamicDialogRef);
  listingService = inject(LandlordListingService);
  toastService = inject(ToastService);
  userService = inject(AuthService);
  router = inject(Router);

  steps: Step[] = [
    {
      id: this.CATEGORY,
      idNext: this.LOCATION,
      idPrevious: null,
      isValid: false
    },
    {
      id: this.LOCATION,
      idNext: this.INFO,
      idPrevious: this.CATEGORY,
      isValid: false
    },
    {
      id: this.INFO,
      idNext: this.PHOTOS,
      idPrevious: this.LOCATION,
      isValid: false
    },
    {
      id: this.PHOTOS,
      idNext: this.DESCRIPTION,
      idPrevious: this.INFO,
      isValid: false
    },
    {
      id: this.DESCRIPTION,
      idNext: this.PRICE,
      idPrevious: this.PHOTOS,
      isValid: false
    },
    {
      id: this.PRICE,
      idNext: null,
      idPrevious: this.DESCRIPTION,
      isValid: false
    }
  ];

  currentStep = this.steps[0];

  newListing: NewListing = {
    category: "AMAZING_VIEWS",
    infos: {
      guests: {value: 0},
      bedrooms: {value: 0},
      beds: {value: 0},
      baths: {value: 0}
    },
    location: "",
    pictures: new Array<NewListingPicture>(),
    description: {
      title: {value: ""},
      description: {value: ""}
    },
    price: {value: 0}
  };

  loadingCreation = false;



  /**
   * PropertiesCreateComponent constructor. Initializes listeners for user and listing creation events.
   */
  constructor() {
    this.listenFetchUser();
    this.listenListingCreation();
  }

  /**
   * Initiates the creation of a new listing by calling the listing service.
   * @returns void
   */
  createListing(): void {
    this.loadingCreation = true;
    this.listingService.create(this.newListing);
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Resets the listing creation state.
   * @returns void
   */
  ngOnDestroy(): void {
    this.listingService.resetListingCreation();
  }

  /**
   * Listens for changes in the user and listing creation state to navigate on success.
   * @returns void
   */
  listenFetchUser(): void {
    effect(() => {
      if (this.userService.fetchUser().status === "OK"
        && this.listingService.createSig().status === "OK") {
        this.router.navigate(["landlord", "properties"]);
      }
    });
  }

  /**
   * Listens for changes in the listing creation state to handle success or error.
   * @returns void
   */
  listenListingCreation(): void {
    effect(() => {
      let createdListingState = this.listingService.createSig();
      if (createdListingState.status === "OK") {
        this.onCreateOk(createdListingState);
      } else if (createdListingState.status === "ERROR") {
        this.onCreateError();
      }
    });
  }

  /**
   * Handles successful creation of a listing.
   * @param createdListingState The state containing the created listing.
   * @returns void
   */
  onCreateOk(createdListingState: State<CreatedListing>): void {
    this.loadingCreation = false;
    this.toastService.send({
      severity: "success", summary: "Success", detail: "Listing created successfully.",
    });
    this.dialogDynamicRef.close(createdListingState.value?.publicId);
    this.userService.fetch(true);
  }

  /**
   * Handles errors during the creation of a listing.
   * @private
   * @returns void
   */
  private onCreateError(): void {
    this.loadingCreation = false;
    this.toastService.send({
      severity: "error", summary: "Error", detail: "Couldn't create your listing, please try again.",
    });
  }

  /**
   * Advances to the next step in the listing creation process.
   * @returns void
   */
  nextStep(): void {
    if (this.currentStep.idNext !== null) {
      this.currentStep = this.steps.filter((step: Step) => step.id === this.currentStep.idNext)[0];
    }
  }

  /**
   * Returns to the previous step in the listing creation process.
   * @returns void
   */
  previousStep(): void {
    if (this.currentStep.idPrevious !== null) {
      this.currentStep = this.steps.filter((step: Step) => step.id === this.currentStep.idPrevious)[0];
    }
  }

  /**
   * Checks if all steps in the listing creation process are valid.
   * @returns True if all steps are valid, false otherwise.
   */
  isAllStepsValid(): boolean {
    return this.steps.filter(step => step.isValid).length === this.steps.length;
  }

  /**
   * Updates the listing's category when the category changes.
   * @param newCategory The new category name.
   * @returns void
   */
  onCategoryChange(newCategory: CategoryName): void {
    this.newListing.category = newCategory;
  }

  /**
   * Updates the validity state of the current step.
   * @param validity The validity state (true if valid, false otherwise).
   * @returns void
   */
  onValidityChange(validity: boolean): void {
    this.currentStep.isValid = validity;
  }

  /**
   * Updates the listing's location when the location changes.
   * @param newLocation The new location string.
   * @returns void
   */
  onLocationChange(newLocation: string): void {
    this.newListing.location = newLocation;
  }

  /**
   * Updates the listing's info when the info changes.
   * @param newInfo The new listing info.
   * @returns void
   */
  onInfoChange(newInfo: NewListingInfo): void {
    this.newListing.infos = newInfo;
  }

  /**
   * Updates the listing's pictures when the pictures change.
   * @param newPictures The new array of listing pictures.
   * @returns void
   */
  onPictureChange(newPictures: NewListingPicture[]): void {
    this.newListing.pictures = newPictures;
  }

  /**
   * Updates the listing's description when the description changes.
   * @param newDescription The new description object.
   * @returns void
   */
  onDescriptionChange(newDescription: Description): void {
    this.newListing.description = newDescription;
  }

  /**
   * Updates the listing's price when the price changes.
   * @param newPrice The new price value object.
   * @returns void
   */
  onPriceChange(newPrice: PriceVO): void {
    this.newListing.price = newPrice;
  }
}
