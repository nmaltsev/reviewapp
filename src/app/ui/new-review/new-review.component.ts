import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Review} from '../../models/review.model';
import {SolidProfile} from '../../models/solid-profile.model';
import {RdfService} from '../../services/rdf.service';
import {Property, PropertyType} from '../../models/property.model';
import {Address} from '../../models/address.model';

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

  constructor(private rdfService: RdfService) { }

  async ngOnInit() {
    // TODO replace with "stars"
    this.rates = [
        {rate: 5, desc: 'Excellent'},
        {rate: 4, desc: 'Very good'},
        {rate: 3, desc: 'Average'},
        {rate: 2, desc: 'Poor'},
        {rate: 1, desc: 'Terrible'},
    ];
    this.newReview = new Review(Date.now().toString(), '', '');
    let newProp = new Property(PropertyType.hotel, '', new Address());
    this.newReview.setProperty(newProp);
    this.authUser = await this.rdfService.getProfile();
    this.newReview.setAuthor(this.authUser);
  }

  onSubmit() {
    // TODO create new review
  }

}
