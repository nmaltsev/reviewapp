import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import {LoginPopupComponent} from './login-popup/login-popup.component';
import {LoginComponent} from './login/login.component';
import { CardComponent } from './card/card.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LegendComponent } from './pages/legend/legend.component';

// Services
import { AuthService } from './services/solid.auth.service';
import { AuthGuard } from './services/auth.guard.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from './register/register.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TopNavComponent } from './ui/top-nav/top-nav.component';
import { LegendProfileCardComponent } from './ui/legend-profile-card/legend-profile-card.component';
import { ReviewComponent } from './ui/review/review.component';



const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'login-popup',
    component: LoginPopupComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'card',
    component: CardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'legend',
    component: LegendComponent
  },
  { path: '**', redirectTo: 'dashboard' } // fallback if page not found
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginPopupComponent,
    DashboardComponent,
    CardComponent,
    RegisterComponent,
    LegendComponent,
    TopNavComponent,
    LegendProfileCardComponent,
    ReviewComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes/*, {useHash: true}*/),
    NgSelectModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule //required for toastr
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
