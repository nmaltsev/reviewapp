import { 
  Component, 
  OnInit, 
  AfterViewInit, 
  ViewChild, 
  ViewContainerRef, 
  ViewEncapsulation 
} from '@angular/core';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-popup-root',
  templateUrl: './popup-root.component.html',
  styleUrls: ['./popup-root.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PopupRootComponent implements OnInit, AfterViewInit {
  @ViewChild('host', { read: ViewContainerRef }) viewContainerRef: ViewContainerRef
  constructor(private popupService: PopupService) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.popupService.setRootViewContainerRef(this.viewContainerRef);
  }
}
