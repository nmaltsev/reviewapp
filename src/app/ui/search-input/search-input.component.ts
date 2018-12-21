import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import {debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.sass']
})
export class SearchInputComponent implements OnInit {
  public visibleValue = '';
  public searchField: FormControl;
  @ViewChild('field') field: ElementRef;

  @Input()
  set query(value: string) {
    this.updateQuery(value);
  }
  @Output() queryChange: EventEmitter<string> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.searchField = new FormControl();
    this.searchField.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(
        r => this.updateQuery(r)
      )
    ).subscribe();
  }

  private updateQuery(newValue: string): void {
    this.visibleValue = newValue;
    if (this.field.nativeElement) {
      if (newValue) {
        this.field.nativeElement.setAttribute('value', newValue);
      } else {
        this.field.nativeElement.removeAttribute('value');
      }
      this.field.nativeElement.value = newValue;
      this.queryChange.emit(newValue);
    }
  }

  public clear(): void {
    this.updateQuery('');
  }

}
