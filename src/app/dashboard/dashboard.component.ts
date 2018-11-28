import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Services
import { AuthService } from '../services/solid.auth.service';
import { RdfService } from '../services/rdf.service';
import { SolidSession } from '../models/solid-session.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private profileLinks: string[];

  constructor(
    private auth: AuthService, 
    private route: ActivatedRoute,
    private rdfService: RdfService
  ) {}

  async ngOnInit() {
    let session:SolidSession = await this.rdfService.getSession();

    if (session) {
      let profileLinks:string[] = await this.rdfService.getFriendsOf(session.webId);

      profileLinks.push(this.rdfService.session.webId);
      
      this.profileLinks = profileLinks.map(encodeURIComponent);
    } else {
      this.profileLinks = [];
    }
  }

  
  onSignOut = () => {
    this.auth.solidSignOut();
  }

}
