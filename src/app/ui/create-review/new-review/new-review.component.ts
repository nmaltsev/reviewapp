import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Review} from '../../../models/review.model';
import {SolidProfile} from '../../../models/solid-profile.model';
import {RdfService} from '../../../services/rdf.service';
import {Property, PropertyType} from '../../../models/property.model';
import {Address} from '../../../models/address.model';
import { ReviewService } from 'src/app/services/review.service';
import * as SolidAPI  from '../../../models/solid-api';
import { Router } from '@angular/router';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-new-review',
  templateUrl: './new-review.component.html',
  styleUrls: ['./new-review.component.css']
})
export class NewReviewComponent implements OnInit {
    authUser: SolidProfile;
    newReview: Review;
    rates = [];
    @ViewChild('frm') reviewForm: NgForm;

  constructor(
    private rdfService: RdfService,
    private reviewService: ReviewService,
    private router: Router,
    private popupService: PopupService
  ) { }

  async ngOnInit() {
    // TODO replace with "stars"
    this.rates = [
        {rate: 5, desc: 'Excellent'},
        {rate: 4, desc: 'Very good'},
        {rate: 3, desc: 'Average'},
        {rate: 2, desc: 'Poor'},
        {rate: 1, desc: 'Terrible'},
    ];
    this.newReview = new Review('');
    let newProp = new Property(PropertyType.hotel, '', new Address());
    this.newReview.setProperty(newProp);
    this.authUser = await this.rdfService.getProfile();
    this.newReview.setAuthor(this.authUser);
  }

  onSubmit(f: NgForm) {
    // We need clone() method, because resetForm() will reset this.newReview
    const review: Review = this.newReview.clone(this.reviewService.generateDocumentUID()); 

    this.reviewService.saveReview(review).then((e: SolidAPI.IResponce) => {
      if (e.status == 200) {
        f.resetForm();

        // if (confirm('Review was saved. Open the review list?')) {
        //   this.router.navigate(['/usertimeline']);
        // }
        this.popupService.confirm('Review was saved. Open the review list?', () => {
          this.router.navigate(['/usertimeline']);
        });
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
