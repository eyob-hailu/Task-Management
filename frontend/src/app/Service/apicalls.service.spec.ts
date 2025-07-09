import { TestBed } from '@angular/core/testing';

import { ApicallsService } from './user-management.service';

describe('ApicallsService', () => {
  let service: ApicallsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApicallsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
