import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindPlaceComponent } from './find-place.component';

describe('FindPlaceComponent', () => {
  let component: FindPlaceComponent;
  let fixture: ComponentFixture<FindPlaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindPlaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindPlaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
