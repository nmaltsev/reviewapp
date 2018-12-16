import { TestBed } from '@angular/core/testing';

import { FriendListService } from './friend-list.service';

describe('FriendListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FriendListService = TestBed.get(FriendListService);
    expect(service).toBeTruthy();
  });
});
