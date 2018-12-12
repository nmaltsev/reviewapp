import { TestBed } from '@angular/core/testing';

import { PrivateStorageService } from './private-storage.service';

describe('PrivateStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PrivateStorageService = TestBed.get(PrivateStorageService);
    expect(service).toBeTruthy();
  });
});
