import { TestBed } from '@angular/core/testing';

import { PhotonService } from './photon.service';

describe('PhotonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PhotonService = TestBed.get(PhotonService);
    expect(service).toBeTruthy();
  });
});
