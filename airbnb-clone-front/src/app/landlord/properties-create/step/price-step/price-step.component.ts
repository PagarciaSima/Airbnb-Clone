import {Component, EventEmitter, input, Output, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {PriceVO} from "../../../model/listing-vo.model";

@Component({
  selector: 'app-price-step',
  standalone: true,
  imports: [FormsModule, InputTextModule, FontAwesomeModule],
  templateUrl: './price-step.component.html',
  styleUrl: './price-step.component.scss'
})
export class PriceStepComponent {

  price = input.required<PriceVO>();


  /**
   * Emits the updated price when the price changes.
   */
  @Output()
  priceChange: EventEmitter<PriceVO> = new EventEmitter<PriceVO>();


  /**
   * Emits the validity state of the step (true if valid, false otherwise).
   */
  @Output()
  stepValidityChange: EventEmitter<boolean> = new EventEmitter<boolean>();


  /**
   * Reference to the price form in the template.
   */
  @ViewChild("formPrice")
  formPrice: NgForm | undefined;


  /**
   * Handles changes to the price input field.
   * @param newPrice The new price value.
   * @returns void
   */
  onPriceChange(newPrice: number): void {
    this.priceChange.emit({value: newPrice});
    this.stepValidityChange.emit(this.validateForm());
  }

  /**
   * Validates the price form.
   * @private
   * @returns True if the form is valid, false otherwise.
   */
  private validateForm(): boolean {
    if (this.formPrice) {
      return this.formPrice?.valid!;
    } else {
      return false;
    }
  }
}