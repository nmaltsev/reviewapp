import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/solid.auth.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
  show = false;
  links: Array<Object>;
  isLogged: boolean;

  constructor(private auth: AuthService) { }

  ngOnInit() {
    // TODO Change the way we check if user is authenticated
    this.isLogged = !(localStorage.getItem('solid-auth-client') === null);
    if (this.isLogged) {
        this.links = [
            {route: '/dashboard', name: 'Dashboard'},
            {route: '/card', name: 'Profile Settings'}
        ];
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
