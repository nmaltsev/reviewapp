import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Review, VisibilityTypes} from '../../../models/sdm/review.model';
import {SolidProfile} from '../../../models/solid-profile.model';
import {RdfService} from '../../../services/rdf.service';
import {Place} from '../../../models/sdm/place.model';
import {AddressModel} from '../../../models/sdm/address.model';
import { ReviewService } from 'src/app/services/review.service';
import * as SolidAPI from '../../../models/solid-api';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {PhotonInterface} from '../../../models/photon-interface.model';
import { PrivateStorageService } from 'src/app/services/private-storage/private-storage.service';
import { uid } from 'src/app/utils/tools';

interface IVisibilityOption {
  id: VisibilityTypes;
  label: string;
}

@Component({
  selector: 'app-new-review',
  templateUrl: './new-review.component.html',
  styleUrls: ['./new-review.component.css']
})
export class NewReviewComponent implements OnInit {
  private sub: Subscription;
  placeType: string;
  private _place: PhotonInterface;
  @Input()
      set place(place: PhotonInterface) {
        console.log('Place');
        console.dir(place);
        this._place = place; 
      }
      get place(): PhotonInterface {return this._place; }
    authUser: SolidProfile;
    newReview: Review;
    rates = [];
    @ViewChild('frm', { static: false }) reviewForm: NgForm;
  public visibilityOptions: IVisibilityOption[] = [
    {id: VisibilityTypes.public, label: 'For public'},
    {id: VisibilityTypes.friends, label: 'For friends'}
  ];
  public selectedVisibility: VisibilityTypes = VisibilityTypes.public;

  constructor(
    private rdfService: RdfService,
    private reviewService: ReviewService,
    private router: Router,
    private route: ActivatedRoute,
    private privateStorage: PrivateStorageService
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
    console.log(this.place);
    this.newReview = new Review('');
    const pl = this.place.properties;

    // Attention: pl.city property have only hotels or restaurants, villages and cities have names and value types
    let locality:string = pl.city || 
      (pl.osm_value == 'village' || pl.osm_value == 'city' ? pl.name : null); 

    const newPlace = new Place(
      this.placeType, pl.name, new AddressModel(pl.country, locality, pl.state, pl.street), pl.osm_id);
    this.newReview.setThing(newPlace);
    this.authUser = await this.rdfService.getProfile();
    this.newReview.setAuthor(this.authUser);
  }

  getParams() {
    this.sub = this.route
        .queryParams
        .subscribe((params: Params) => {
          const rType = decodeURIComponent(params['type']);
          switch (rType) {
            case 'hotel': this.placeType = 'schema:Hotel'; break;
            case 'restaurant': this.placeType = 'schema:Restaurant'; break;
            default: this.placeType = 'schema:Hotel'; break;
          }
        });
  }

  onSubmit(f: NgForm): void {
    // We need clone() method, because resetForm() will reset this.newReview
    const review: Review = this.newReview.clone(uid.generateDocumentUID());

    if (this.selectedVisibility == VisibilityTypes.public) {
      this.reviewService.saveReview(review).then((e: SolidAPI.IResponce) => {
        if (e.status == 200) {
          this.router.navigate(['/usertimeline']);
        } else {
          console.warn('You have another troubles');
          console.dir(e);
        }
      });
    } else if (this.selectedVisibility == VisibilityTypes.friends) {
      // TODO save review in private storage
      this.privateStorage.addReview(review).then((status: boolean) => {
        console.log('Save in Private storage %s', status);
        this.router.navigate(['/usertimeline']);
      });
    }
  }

  onReset() {
    console.log('Reset');
  }
}
