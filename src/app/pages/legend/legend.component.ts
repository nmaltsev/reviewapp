import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";
import { Subscription} from 'rxjs';
import { RdfService } from '../../services/rdf.service';
import { SolidProfile } from '../../models/solid-profile.model';


@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  private sub: Subscription;
  private webId: string;
  private authorizedWebId: string;
  private profileData: SolidProfile;

  constructor(
    private route: ActivatedRoute,
    private rdfService: RdfService
  ) {
    this.authorizedWebId = this.rdfService.session ? this.rdfService.session.webId : '';
  }

  ngOnInit() {
    // http://localhost:4200/legend?webId=https%3A%2F%2Fnmaltsev.inrupt.net%2Fprofile%2Fcard%23me

    // Extract WebId from url query
    this.sub = this.route
      .queryParams
      .subscribe(async (params: Params) => {
        this.webId = decodeURIComponent(params['webId']) || this.authorizedWebId;
        console.log('WebId: %s', this.webId);

        this.profileData = await this.rdfService.collectProfileData(this.webId);

        console.log('profileData');
        console.dir(this.profileData);
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
