import { TestBed } from '@angular/core/testing';

import { LandorListingService } from './landor-listing.service';

describe('LandorListingService', () => {
  let service: LandorListingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LandorListingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
