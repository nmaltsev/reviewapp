import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/solid.auth.service';
import {RdfService} from '../../services/rdf.service';
import {SolidProfile} from '../../models/solid-profile.model';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
  show = false;
  links: Array<Object>;
  isLogged: boolean;
  authUser: SolidProfile;

  constructor(private auth: AuthService, private rdfService: RdfService) { }

  async ngOnInit() {
    // TODO Change the way we check if user is authenticated
    this.isLogged = !(localStorage.getItem('solid-auth-client') === null);
    if (this.isLogged) {
      this.authUser = await this.rdfService.getProfile();
    } else {
        this.links = [
            {route: '/login', name: 'Login'}
        ];
    }

  }

  toggleCollapse() {
    this.show = !this.show;
  }

    // Example of logout functionality. Normally wouldn't be triggered by clicking the profile picture.
    logout() {
        this.auth.solidSignOut();
    }

}
