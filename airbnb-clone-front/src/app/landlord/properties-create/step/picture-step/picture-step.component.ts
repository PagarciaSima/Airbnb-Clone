import {Component, EventEmitter, input, Output} from '@angular/core';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {NewListingPicture} from "../../../model/picture.model";

@Component({
  selector: 'app-picture-step',
  standalone: true,
  imports: [FontAwesomeModule, InputTextModule, ButtonModule],
  templateUrl: './picture-step.component.html',
  styleUrls: ['./picture-step.component.scss']
})
export class PictureStepComponent {

  pictures = input.required<Array<NewListingPicture>>();


  /**
   * Emits the updated list of pictures when pictures are added or removed.
   */
  @Output()
  picturesChange: EventEmitter<Array<NewListingPicture>> = new EventEmitter<Array<NewListingPicture>>();


  /**
   * Emits the validity state of the step (true if valid, false otherwise).
   */
  @Output()
  stepValidityChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Extracts the FileList from the given event target if available.
   * @param target The event target from the file input.
   * @returns The FileList if available, otherwise null.
   */
  extractFileFromTarget(target: EventTarget | null): FileList | null {
    const htmlInputTarget = target as HTMLInputElement;
    if (target === null || htmlInputTarget.files === null) {
      return null;
    }
    return htmlInputTarget.files;
  }

  /**
   * Handles the upload of new pictures, adds them to the pictures array, and emits changes.
   * @param target The event target from the file input.
   * @returns void
   */
  onUploadNewPicture(target: EventTarget | null): void {
    const picturesFileList = this.extractFileFromTarget(target);
    if(picturesFileList !== null) {
      for(let i = 0 ; i < picturesFileList.length; i++) {
        const picture = picturesFileList.item(i);
        if (picture !== null) {
          const displayPicture: NewListingPicture = {
            file: picture,
            urlDisplay: URL.createObjectURL(picture)
          }
          this.pictures().push(displayPicture);
        }
      }
      this.picturesChange.emit(this.pictures());
      this.validatePictures();
    }
  }

  /**
   * Validates the number of pictures and emits the validity state.
   * @private
   * @returns void
   */
  private validatePictures(): void {
    if (this.pictures().length >= 5) {
      this.stepValidityChange.emit(true);
    } else {
      this.stepValidityChange.emit(false);
    }
  }

  /**
   * Removes a picture from the pictures array and validates the remaining pictures.
   * @param pictureToDelete The picture to remove.
   * @returns void
   */
  onTrashPicture(pictureToDelete: NewListingPicture): void {
    const indexToDelete = this.pictures().findIndex(picture => picture.file.name === pictureToDelete.file.name);
    this.pictures().splice(indexToDelete, 1);
    this.validatePictures();
  }
}