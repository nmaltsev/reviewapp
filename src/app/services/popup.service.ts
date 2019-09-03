import { 
  Compiler,
  ViewContainerRef,
  Component,
  NgModule, 
  Injectable,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  constructor(
    private compiler: Compiler,
  ) { }

  private rootViewContainer: ViewContainerRef;

  public setRootViewContainerRef(viewContainerRef) {
    this.rootViewContainer = viewContainerRef
  }

  public addDynamicComponent(ComponentCostructor): any {
    @NgModule({
      imports: [BrowserModule],
      declarations: [ComponentCostructor],
    }) class DynamicModule { }

    const mod = this.compiler.compileModuleAndAllComponentsSync(DynamicModule);
    const factory = mod.componentFactories.find((comp) =>
      comp.componentType === ComponentCostructor
    );

    let cmpRef = this.rootViewContainer.createComponent(factory);
    this.rootViewContainer.insert(cmpRef.hostView);
    cmpRef.instance._self = cmpRef;

    return cmpRef;
  }

  // Example of simple component
  public getDynamicComponent() {
    @Component({
      template: '<p (click)="test()">This was inserted!</p>'
    }) class InsertedComponent {
      constructor(/*public _parent: AppComponent*/) {}
      test() {
        alert(Math.random());
      }
    };

    return InsertedComponent;
  }

  public createConfirmPopup (title: string, onsubmit?:() => void, onreset?: () => void): any {
    @Component({
      template: `<dialog #root class="m3-modal" open>
        <form class="m3-modal_inner _size-a" (submit)="onsubmit($event)" (reset)="onreset($event)">
          <p>${title}</p>
          <div class="btn-line">
            <button type="submit" class="btn btn-success">Yes</button>
            <button type="reset" class="btn">No</button>
          </div>
        </form>
      </dialog>`
    }) class PopupComponent implements OnInit{
      constructor() {}
      @ViewChild('root', {static: false}) dialog: ElementRef;
      _self: any;
      ngOnInit() { }
      onsubmit(e) {
        e.preventDefault();
        if (onsubmit) onsubmit();
        this.close();
      }
      onreset(e) {
        e.preventDefault();
        if (onreset) onreset();
        this.close();
      }
      // onDestroy() { }
      close() {
        const $dialog: Element = this.dialog.nativeElement;
        $dialog.removeAttribute('open');
        this._self.destroy();
      }
    };

    return PopupComponent;
  }

  public confirm(title: string, onsubmit?:() => void, onreset?:() => void) {
    this.addDynamicComponent(this.createConfirmPopup(title, onsubmit, onreset));
  }
  
}
