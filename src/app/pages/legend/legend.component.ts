import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";
import { Subscription, Subject } from 'rxjs';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  private sub: Subscription;
  private webId: String;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // http://localhost:4200/legend?webId=https%3A%2F%2Fnmaltsev.inrupt.net%2Fprofile%2Fcard%23me

    // Extract WebId from url query
    this.sub = this.route
      .queryParams
      .subscribe((params: Params) => {
        this.webId = decodeURIComponent(params['webId']) || '';
        console.log('WebId: %s', this.webId);
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
