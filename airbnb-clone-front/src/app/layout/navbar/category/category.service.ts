import { Injectable } from '@angular/core';
import { categoryDataArray } from './category-data';
import { Category } from './category.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private categories: Category[] = categoryDataArray;
  private changeCategory$ = new BehaviorSubject<Category>(this.getCategoryByDefault());
  changeCategoryObs = this.changeCategory$.asObservable();
  
  
  constructor() { }

  changeCategory(category: Category): void {
    this.changeCategory$.next(category);
  }

  getCategories(): Category[] {
    return this.categories;
  }

  getCategoryByDefault(): Category {
    return this.categories[0];
  }

  getCategoryByTechnicalName(technicalName: string): Category | undefined {
    return this.categories.find(category => category.technicalName === technicalName);
  }
}

