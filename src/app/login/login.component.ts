import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// Auth Service
import { AuthService } from '../services/solid.auth.service';
import { SolidProvider } from '../models/solid-provider.model';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router) { }

  /**
   * A list of Solid Identity Providers
   * @type {SolidProvider[]}
   */
  identityProviders: SolidProvider[];
  selectedProviderUrl: string;
  customProviderUrl: string;
  private MAIN_PAGE: string = '/dashboard';

  ngOnInit() {

    console.log('OnInit %s', localStorage.getItem('solid-auth-client'));
    // If we're authenticated, go to profile
    if (localStorage.getItem('solid-auth-client')) {
      this.router.navigateByUrl(this.MAIN_PAGE);
    }

    this.identityProviders = this.auth.getIdentityProviders();
  }

  /*
  *  Alternate login-popup function for Solid. See service for more details.
  */
  onLoginPopup = async () => {
    this.auth.solidLoginPopup(this.MAIN_PAGE);
  }

  onLogin = async () => {
    const idp: string = this.selectedProviderUrl ? this.selectedProviderUrl : this.customProviderUrl;

    if (idp) {
      try {
        // console.log('Auth');
        // console.dir(window.location)
        // return;
        // this.auth.solidLogin(idp, this.MAIN_PAGE);
        this.auth.solidLogin(idp, window.location.origin + window.location.pathname);
      } catch (err) {
        console.log('An error has occurred logging in: ' + err);
      }
    }
  }

  goToRegistration() {
    this.router.navigateByUrl('/register');
  }
}
