import {Component, EventEmitter, input, Output, ViewChild} from '@angular/core';
import {InputTextModule} from "primeng/inputtext";
import {FormsModule, NgForm} from "@angular/forms";
import {Description} from "../../../model/listing.model";
import {InputTextareaModule} from "primeng/inputtextarea";

@Component({
  selector: 'app-description-step',
  standalone: true,
  imports: [InputTextModule, FormsModule, InputTextareaModule],
  templateUrl: './description-step.component.html',
  styleUrls: ['./description-step.component.scss']
})
export class DescriptionStepComponent {

  description = input.required<Description>();


  /**
   * Emits the updated description when the title or description changes.
   */
  @Output()
  descriptionChange: EventEmitter<Description> = new EventEmitter<Description>();


  /**
   * Emits the validity state of the step (true if valid, false otherwise).
   */
  @Output()
  stepValidityChange: EventEmitter<boolean> = new EventEmitter<boolean>();


  /**
   * Reference to the description form in the template.
   */
  @ViewChild("formDescription")
  formDescription: NgForm | undefined;

  /**
   * Handles changes to the title input field.
   * @param newTitle The new title string.
   * @returns void
   */
  onTitleChange(newTitle: string): void {
    this.description().title = {value: newTitle};
    this.descriptionChange.emit(this.description());
    this.stepValidityChange.emit(this.validateForm());
  }

  /**
   * Handles changes to the description input field.
   * @param newDescription The new description string.
   * @returns void
   */
  onDescriptionChange(newDescription: string): void {
    this.description().description = {value: newDescription};
    this.descriptionChange.emit(this.description());
    this.stepValidityChange.emit(this.validateForm());
  }

  /**
   * Validates the description form.
   * @private
   * @returns True if the form is valid, false otherwise.
   */
  private validateForm(): boolean {
    if (this.formDescription) {
      return this.formDescription?.valid!;
    } else {
      return false;
    }
  }
}