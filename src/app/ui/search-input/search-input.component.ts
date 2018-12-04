import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.sass']
})
export class SearchInputComponent implements OnInit {
  public visibleValue: string = '';
  @ViewChild('field') field:ElementRef;

  @Input()
  set query(value: string) {
    this.updateQuery(value);
  }
  @Output() queryChange: EventEmitter<string> = new EventEmitter();
  
  constructor() { }

  ngOnInit() { }

  public oninput(e: Event): void {
    this.updateQuery((<HTMLInputElement>e.target).value);
  }

  public clear(): void {
    this.updateQuery('');
  }
  
  private updateQuery(newValue: string): void {
    this.visibleValue = newValue;
    
    if (this.field.nativeElement){
      if (newValue) {
        this.field.nativeElement.setAttribute('value', newValue);
      } else {
        this.field.nativeElement.removeAttribute('value');
      }
      this.field.nativeElement.value = newValue;
      this.queryChange.emit(newValue);
    } 
  }

}
