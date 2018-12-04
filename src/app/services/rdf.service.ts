import { Injectable } from '@angular/core';
import { SolidSession } from '../models/solid-session.model';
import { ISolidRoot } from '../models/solid-api';
import * as RDF from '../models/rdf.model';

declare let solid: ISolidRoot;
declare let $rdf: RDF.IRDF;


// TODO: Remove any UI interaction from this service
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SolidProfile } from '../models/solid-profile.model';
import { IAddress } from '../models/address.model';

const VCARD:RDF.Namespace = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');
const FOAF:RDF.Namespace = $rdf.Namespace('http://xmlns.com/foaf/0.1/');

/**
 * A service layer for RDF data manipulation using rdflib.js
 * @see https://solid.inrupt.com/docs/manipulating-ld-with-rdflib
 */
@Injectable({
  providedIn: 'root',
})
export class RdfService {

  session: SolidSession;
  store: RDF.IStore = $rdf.graph();
  private parsedProfileCache: {[key: string]: SolidProfile} = {};

  /**
   * A helper object that connects to the web, loads data, and saves it back. More powerful than using a simple
   * store object.
   * When you have a fetcher, then you also can ask the query engine to go fetch new linked data automatically
   * as your query makes its way across the web.
   * @see http://linkeddata.github.io/rdflib.js/doc/Fetcher.html
   */
  fetcher:RDF.IFetcher /*= $rdf.Fetcher*/;

  /**
   * The UpdateManager allows you to send small changes to the server to “patch” the data as your user changes data in
   * real time. It also allows you to subscribe to changes other people make to the same file, keeping track of
   * upstream and downstream changes, and signaling any conflict between them.
   * @see http://linkeddata.github.io/rdflib.js/doc/UpdateManager.html
   */
  updateManager:RDF.IUpdateManager/* = $rdf.UpdateManager*/;

  constructor (private toastr: ToastrService) {
    const fetcherOptions = {};
    this.fetcher = new $rdf.Fetcher(this.store, fetcherOptions);
    this.updateManager = new $rdf.UpdateManager(this.store);
    this.getSession();
  }

  /**
   * Fetches the session from Solid, and store results in localStorage
   */
  async getSession(): Promise<SolidSession> {
    this.session = await solid.auth.currentSession(localStorage);
    return this.session;
  }

  /**
   * Gets a node that matches the specified pattern using the VCARD onthology
   *
   * any() can take a subject and a predicate to find Any one person identified by the webId
   * that matches against the node/predicated
   *
   * @param {string} node VCARD predicate to apply to the $rdf.any()
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me)
   * @return {string} The value of the fetched node or an emtpty string
   * @see https://github.com/solid/solid-tutorial-rdflib.js
   */
  getValueFromVcard = (node: string, webId?: string): string | any => {
    return this.getValueFromNamespace(node, VCARD, webId);
  };

  /**
   * Gets a node that matches the specified pattern using the FOAF onthology
   * @param {string} node FOAF predicate to apply to the $rdf.any()
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me)
   * @return {string} The value of the fetched node or an emtpty string
   */
  getValueFromFoaf = (node: string, webId?: string) => {
    return this.getValueFromNamespace(node, FOAF, webId);
  };
 
  transformDataForm = (form: NgForm, me: any, doc: any) => {
    const insertions = [];
    const deletions = [];
    const fields = Object.keys(form.value);
    const oldProfileData = JSON.parse(localStorage.getItem('oldProfileData')) || {};

    // We need to split out into three code paths here:
    // 1. There is an old value and a new value. This is the update path
    // 2. There is no old value and a new value. This is the insert path
    // 3. There is an old value and no new value. Ths is the delete path
    // These are separate codepaths because the system needs to know what to do in each case
    fields.map(field => {

      let predicate = VCARD(this.getFieldName(field));
      let subject = this.getUriForField(field, me);
      let why = doc;

      let fieldValue = this.getFieldValue(form, field);
      let oldFieldValue = this.getOldFieldValue(field, oldProfileData);

      // if there's no existing home phone number or email address, we need to add one, then add the link for hasTelephone or hasEmail
      if(!oldFieldValue && fieldValue && (field === 'phone' || field==='email')) {
        this.addNewLinkedField(field, insertions, predicate, fieldValue, why, me);
      } else {

        //Add a value to be updated
        if (oldProfileData[field] && form.value[field] && !form.controls[field].pristine) {
          deletions.push($rdf.st(subject, predicate, oldFieldValue, why));
          insertions.push($rdf.st(subject, predicate, fieldValue, why));
        }

        //Add a value to be deleted
        else if (oldProfileData[field] && !form.value[field] && !form.controls[field].pristine) {
          deletions.push($rdf.st(subject, predicate, oldFieldValue, why));
        }

        //Add a value to be inserted
        else if (!oldProfileData[field] && form.value[field] && !form.controls[field].pristine) {
          insertions.push($rdf.st(subject, predicate, fieldValue, why));
        }
      }
    });

    return {
      insertions: insertions,
      deletions: deletions
    };
  };

  private addNewLinkedField(field, insertions, predicate, fieldValue, why, me: any) {
    //Generate a new ID. This id can be anything but needs to be unique.
    let newId = field + ':' + Date.now();

    //Get a new subject, using the new ID
    let newSubject = $rdf.sym(this.session.webId.split('#')[0] + '#' + newId);

    //Set new predicate, based on email or phone fields
    let newPredicate = field === 'phone' ? $rdf.sym(VCARD('hasTelephone')) : $rdf.sym(VCARD('hasEmail'));

    //Add new phone or email to the pod
    insertions.push($rdf.st(newSubject, predicate, fieldValue, why));

    //Set the type (defaults to Home/Personal for now) and insert it into the pod as well
    //Todo: Make this dynamic
    let type = field === 'phone' ? $rdf.literal('Home') : $rdf.literal('Personal');
    insertions.push($rdf.st(newSubject, VCARD('type'), type, why));

    //Add a link in #me to the email/phone number (by id)
    insertions.push($rdf.st(me, newPredicate, newSubject, why));
  }

  private getUriForField(field, me): string {
    let uriString: string;
    let uri: any;

    switch(field) {
      case 'phone':
        uriString = this.getValueFromVcard('hasTelephone');
        if(uriString) {
          uri = $rdf.sym(uriString);
        }
        break;
      case 'email':
        uriString = this.getValueFromVcard('hasEmail');
        if(uriString) {
          uri = $rdf.sym(uriString);
        }
        break;
      default:
        uri = me;
        break;
    }

    return uri;
  }

  /**
   * Extracts the value of a field of a NgForm and converts it to a $rdf.NamedNode
   * @param {NgForm} form
   * @param {string} field The name of the field that is going to be extracted from the form
   * @return {RdfNamedNode}
   */
  private getFieldValue(form: NgForm, field: string): any {
    let fieldValue: any;

    if(!form.value[field]) {
      return;
    }

    switch(field) {
      case 'phone':
        fieldValue = $rdf.sym('tel:+'+form.value[field]);
        break;
      case 'email':
        fieldValue = $rdf.sym('mailto:'+form.value[field]);
        break;
      default:
        fieldValue = form.value[field];
        break;
    }

    return fieldValue;
  }

  private getOldFieldValue(field, oldProfile): any {
    let oldValue: any;

    if(!oldProfile || !oldProfile[field]) {
      return;
    }

    switch(field) {
      case 'phone':
        oldValue = $rdf.sym('tel:+'+oldProfile[field]);
        break;
      case 'email':
        oldValue = $rdf.sym('mailto:'+oldProfile[field]);
        break;
      default:
        oldValue = oldProfile[field];
        break;
    }

    return oldValue;
  }

  private getFieldName(field): string {
    switch (field) {
      case 'company':
        return 'organization-name';
      case 'phone':
      case 'email':
        return 'value';
      default:
        return field;
    }
  }

  updateProfile = async (form: NgForm) => {
    const me = $rdf.sym(this.session.webId);
    const doc = $rdf.NamedNode.fromValue(this.session.webId.split('#')[0]);
    const data = this.transformDataForm(form, me, doc);

    //Update existing values
    if(data.insertions.length > 0 || data.deletions.length > 0) {
      this.updateManager.update(data.deletions, data.insertions, (response, success, message) => {
        if(success) {
          this.toastr.success('Your Solid profile has been successfully updated', 'Success!');
          form.form.markAsPristine();
          form.form.markAsTouched();
        } else {
          this.toastr.error('Message: '+ message, 'An error has occurred');
        }
      });
    }
  };

  getAddress(webId?:string):IAddress {
    const linkedUri = this.getValueFromVcard('hasAddress', webId);

    if (linkedUri) {
      return {
        locality: this.getValueFromVcard('locality', linkedUri),
        countryName: this.getValueFromVcard('country-name', linkedUri),
        region: this.getValueFromVcard('region', linkedUri),
        street: this.getValueFromVcard('street-address', linkedUri),
      };
    }

    return {};
  };

  //Function to get email. This returns only the first email, which is temporary
  getEmail(webId?:string):string {
    const linkedUri = this.getValueFromVcard('hasEmail', webId);

    if (linkedUri) {
      return this.getValueFromVcard('value', linkedUri).split('mailto:')[1];
    }

    return '';
  }

  //Function to get phone number. This returns only the first phone number, which is temporary. It also ignores the type.
  getPhone(webId?:string):string {
    const linkedUri = this.getValueFromVcard('hasTelephone', webId);

    if(linkedUri) {
      return this.getValueFromVcard('value', linkedUri).split('tel:+')[1];
    }
  };

  getProfile = async (): Promise<SolidProfile> => {

    if (!this.session) {
      await this.getSession();
    }

    try {
      // This method will return profile from cache
      await this.fetcher.load(this.session.webId);

      return {
        webId: this.session.webId,
        fn : this.getValueFromVcard('fn'),
        company : this.getValueFromVcard('organization-name'),
        phone: this.getPhone(),
        role: this.getValueFromVcard('role'),
        image: this.getValueFromVcard('hasPhoto'),
        address: this.getAddress(),
        email: this.getEmail(),
      };
    } catch (error) {
      console.log(`Error fetching data: ${error}`);
    }
  };

  public async collectProfileData (webId: string): Promise<SolidProfile> {
    if (!this.parsedProfileCache[webId]) {
      await this.fetcher.load(webId);

      this.parsedProfileCache[webId] = {
        webId,
        fn : this.getValueFromVcard('fn', webId),
        company : this.getValueFromVcard('organization-name', webId),
        phone: this.getPhone(),
        role: this.getValueFromVcard('role', webId),
        image: this.getValueFromVcard('hasPhoto', webId),
        address: this.getAddress(),
        email: this.getEmail(),
      };

      let friends: RDF.ITerm[] = this.getCollectionFromNamespace('knows', FOAF, webId);

      if (friends) {
        this.parsedProfileCache[webId].following = friends.length;
      }
    }

    return this.parsedProfileCache[webId];
  }

  /**
   * Gets any resource that matches the node, using the provided Namespace
   * @param {string} node The name of the predicate to be applied using the provided Namespace 
   * @param {$rdf.namespace} namespace The RDF Namespace
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me) 
   */
  private getValueFromNamespace(node: string, namespace: RDF.Namespace, webId?: string): string | any {
    const id: string = webId || this.session && this.session.webId;
    const store: RDF.ITerm = id && this.store.any($rdf.sym(id), namespace(node));

    if (store) {
      return store.value;
    }
    return '';
  }

  private getCollectionFromNamespace(node: string, namespace: RDF.Namespace, webId: string) {
    const list:RDF.ITerm[] = this.store.each($rdf.sym(webId), namespace(node));

    return list;
  }

  public async getFriendsOf(webId: string): Promise<string[]> {
    await this.fetcher.load(webId);
    return (this.getCollectionFromNamespace('knows', FOAF, webId) || []).
      map((item: RDF.ITerm) => item.value);
  }

  public async updateFollowingList(follow: Array<string>, unfollow: Array<string>) {
    const foafKnows = FOAF('knows');
    const authUser = await this.getProfile();
    // Symbol term types
    const meSym = $rdf.sym(authUser.webId);
    const doc = $rdf.sym(authUser.webId.split('#')[0]);
    const insertions = [];
    const deletions = [];
    follow.forEach(function(webId) {
      insertions.push($rdf.st(meSym, foafKnows, $rdf.sym(webId), doc));
    });
    unfollow.forEach(function (webId) {
      deletions.push($rdf.st(meSym, foafKnows, $rdf.sym(webId), doc));
    });

    this.updateManager.update(deletions, insertions, (response, success, message) => {
        if (success) {
            this.toastr.success('Your Following List has been successfully updated', 'Success!');
        } else {
            this.toastr.error('Message: ' + message, 'An error has occurred');
        }
    });
  }
}