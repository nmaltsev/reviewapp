import { ImgErrorDirective } from './imagerror.directive';
import {inject, async, TestBed, ComponentFixture} from '@angular/core/testing';
import { Component, Renderer, ElementRef, DebugElement } from '@angular/core';
import { By } from "@angular/platform-browser";

@Component({
  selector: 'test',
  template: `<img alt="" default-image />`,
})
class TestImageErrorComponent {}


// class MockElementRef extends ElementRef {
//   nativeElement = {};
// }

describe('ImagerrorDirective', () => {
  let component: TestImageErrorComponent;
  let fixture: ComponentFixture<TestImageErrorComponent>;
  let imgEl: DebugElement;

  
  beforeEach(() => {
    TestBed.configureTestingModule({
        declarations: [TestImageErrorComponent, ImgErrorDirective]
    });
    fixture = TestBed.createComponent(TestImageErrorComponent);
    component = fixture.componentInstance;
    imgEl = fixture.debugElement.query(By.css('img'));
  });
  
  // it('should create an instance', () => {
  //   const directive = new ImgErrorDirective();
  //   // const directive = new ImagerrorDirective(new MockElementRef());
  //   expect(directive).toBeTruthy();
  // });

  it('should create component', () => {
    expect(component).toBeDefined();
  });

  it('should have src attribute', async(() => {
    imgEl.triggerEventHandler('error', null);
    fixture.detectChanges();
    expect(imgEl.nativeElement.src).toBe('assets/images/profile.png');
  }));
});


