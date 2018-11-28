import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegendProfileCardComponent } from './legend-profile-card.component';

describe('LegendProfileCardComponent', () => {
  let component: LegendProfileCardComponent;
  let fixture: ComponentFixture<LegendProfileCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LegendProfileCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegendProfileCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
