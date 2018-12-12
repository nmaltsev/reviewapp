import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Review} from '../../../models/review.model';
import {SolidProfile} from '../../../models/solid-profile.model';
import {RdfService} from '../../../services/rdf.service';
import {Property, PropertyType} from '../../../models/property.model';
import {Address} from '../../../models/address.model';
import { ReviewService } from 'src/app/services/review.service';
import * as SolidAPI from '../../../models/solid-api';
import {ActivatedRoute, Params, Router} from '@angular/router';
import { PopupService } from 'src/app/services/popup.service';
import {Subscription} from 'rxjs';
import {PhotonInterface} from '../../../models/photon-interface.model';

@Component({
  selector: 'app-new-review',
  templateUrl: './new-review.component.html',
  styleUrls: ['./new-review.component.css']
})
export class NewReviewComponent implements OnInit {
  private sub: Subscription;
  placeType: PropertyType;
  private _place: PhotonInterface;
  @Input()
      set place(place: PhotonInterface) {this._place = place; }
      get place(): PhotonInterface {return this._place; }
    authUser: SolidProfile;
    newReview: Review;
    rates = [];
    @ViewChild('frm') reviewForm: NgForm;

  constructor(
    private rdfService: RdfService,
    private reviewService: ReviewService,
    private router: Router,
    private route: ActivatedRoute,
    private popupService: PopupService
  ) { }

  async ngOnInit() {
    this.getParams();
    // TODO replace with "stars"
    this.rates = [
        {rate: 5, desc: 'Excellent'},
        {rate: 4, desc: 'Very good'},
        {rate: 3, desc: 'Average'},
        {rate: 2, desc: 'Poor'},
        {rate: 1, desc: 'Terrible'},
    ];
    this.newReview = new Review('');
    const pl = this.place.properties;
    const newProp = new Property(this.placeType, pl.name, new Address(pl.country, pl.city, pl.state, pl.street), pl.osm_id);
    this.newReview.setProperty(newProp);
    this.authUser = await this.rdfService.getProfile();
    this.newReview.setAuthor(this.authUser);
  }

  getParams() {
    this.sub = this.route
        .queryParams
        .subscribe((params: Params) => {
          const rType = decodeURIComponent(params['type']);
          switch (rType) {
            case 'hotel': this.placeType = PropertyType.hotel; break;
            case 'restaurant': this.placeType = PropertyType.restaurant; break;
            default: this.placeType = PropertyType.hotel; break;
          }
          console.log(this.placeType);
        });
  }

  onSubmit(f: NgForm) {
    // We need clone() method, because resetForm() will reset this.newReview
    const review: Review = this.newReview.clone(this.reviewService.generateDocumentUID());
    console.log(review);

    this.reviewService.saveReview(review).then((e: SolidAPI.IResponce) => {
      if (e.status == 200) {
        f.resetForm();
        // if (confirm('Review was saved. Open the review list?')) {
        //   this.router.navigate(['/usertimeline']);
        // }
        this.router.navigate(['/usertimeline']);
        /*this.popupService.confirm('Review was saved. Open the review list?', () => {
          this.router.navigate(['/usertimeline']);
        });*/
        // TODO
      } else if (e.status == 401) { // You are not authorized
        // Strange: when I have caught that error, the application after reloding did not show me authorization page
        // So, that behaviour must be rechecked
        alert('Look in dev console');
        console.warn('You have caught 401 error');
        console.dir(e);
        alert('continue');
        this.router.navigate(['/login']);
      } else {
        console.warn('You have another troubles');
        console.dir(e);
      }
    });
  }

  onReset() {
    console.log('Reset');
  }
}
