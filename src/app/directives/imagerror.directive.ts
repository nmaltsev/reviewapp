import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[default-image]'
})
export class ImagerrorDirective {

  private element: HTMLImageElement;

  constructor(private elRef: ElementRef) {
    // elRef will get a reference to the element where the directive is placed
    this.element = elRef.nativeElement;
  }
  
  ngOnInit() {
    this.element.onerror = function(e: Event) {
      if (e.target) {
        let img: HTMLImageElement = (<HTMLImageElement>e.target);
        img.src = img.getAttribute('default-image') ||'assets/images/profile.png';
      }
    }
  }
  
  ngOnDestroy() {
    this.element.onerror = null;
  }
}
