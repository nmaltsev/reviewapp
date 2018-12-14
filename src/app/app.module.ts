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
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RegisterComponent } from './register/register.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TopNavComponent } from './ui/top-nav/top-nav.component';
import { LegendProfileCardComponent } from './ui/legend-profile-card/legend-profile-card.component';
import { ReviewComponent } from './ui/review/review.component';
import { TimePassedPipe } from './utils/time-passed.pipe';
import { NewReviewComponent } from './ui/create-review/new-review/new-review.component';

import {NgbDropdownModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import { PopupRootComponent } from './ui/popup-root/popup-root.component';
import { SearchInputComponent } from './ui/search-input/search-input.component';
import { ReviewFilterPipe } from './utils/review-filter.pipe';
import { FollowingListComponent } from './ui/following/following-list/following-list.component';
import { FollowingItemComponent } from './ui/following/following-item/following-item.component';
import { FindPlaceComponent } from './ui/create-review/find-place/find-place.component';
import {HttpClientModule} from '@angular/common/http';
import { MultistepFormComponent } from './ui/create-review/multistep-form/multistep-form.component';
import { ImagerrorDirective } from './directives/imagerror.directive';
import { QueueService } from './services/queue/queue.service';
import { take, tap } from 'rxjs/operators';
import { PrivateStorageService } from './services/private-storage/private-storage.service';

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
    path: 'reviews',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'card',
    component: CardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'usertimeline',
    component: LegendComponent
  },
  {
    path: 'create-review',
    component: MultistepFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'following-list',
    component: FollowingListComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: 'generaltimeline' } // fallback if page not found
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
    ReviewComponent,
    TimePassedPipe,
    NewReviewComponent,
    PopupRootComponent,
    SearchInputComponent,
    ReviewFilterPipe,
    FollowingListComponent,
    FollowingItemComponent,
    FindPlaceComponent,
    MultistepFormComponent,
    ImagerrorDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    // RouterModule.forRoot(routes, {useHash: true}),
    NgSelectModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule, //required for toastr
    NgbDropdownModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbTypeaheadModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(
    private queue:QueueService, 
    private auth: AuthService,
    private priavateStorage: PrivateStorageService
  ) {
    this.initializeAppFiles();
  }
  private initializeAppFiles(): void {
    this.auth.session.subscribe((session) => {
      if (!session || !session.webId) { // User is logout
        return; 
      }
      this.queue.initializeStore(session.webId);
      this.priavateStorage.initializeStore(session.webId);
    });
  }
}
