import { Component, EventEmitter, inject, input, OnInit, Output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { CategoryName, Category } from '../../../../layout/navbar/category/category.model';
import { CategoryService } from '../../../../layout/navbar/category/category.service';

@Component({
  selector: 'app-category-step',
  standalone: true,
  imports: [
    FaIconComponent
  ],
  templateUrl: './category-step.component.html',
  styleUrl: './category-step.component.scss'
})
export class CategoryStepComponent implements OnInit {

  categoryName = input.required<CategoryName>();


  /**
   * Emits the selected category name when the user selects a category.
   */
  @Output()
  categoryChange: EventEmitter<CategoryName> = new EventEmitter<CategoryName>();


  /**
   * Emits the validity state of the step (true if valid, false otherwise).
   */
  @Output()
  stepValidityChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  categoryService = inject(CategoryService);
  categories: Category[] | undefined;


  /**
   * Angular lifecycle hook called on component initialization.
   * Loads the list of available categories from the CategoryService.
   * @returns void
   */
  ngOnInit(): void {
    this.categories = this.categoryService.getCategories();
  }

  /**
   * Handles the selection of a new category and emits the changes.
   * @param newCategory The newly selected category name.
   * @returns void
   */
  onSelectCategory(newCategory: CategoryName): void {
    this.categoryChange.emit(newCategory);
    this.stepValidityChange.emit(true);
  }
}
