import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupRootComponent } from './popup-root.component';

describe('PopupRootComponent', () => {
  let component: PopupRootComponent;
  let fixture: ComponentFixture<PopupRootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupRootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
