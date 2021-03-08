import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactMethod } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';
import { ordinal } from 'src/app/util/ordinal';
import { commonPlatforms } from 'src/app/util/platforms';

type ContactCard = {
  platformSelection: string;
  customPlatform?: string; // set if platformSelection is "Other"
  contactID: string;
};

@Component({
  selector: 'app-edit-contact-info',
  templateUrl: './edit-contact-info.component.html',
  styleUrls: ['./edit-contact-info.component.scss']
})
export class EditContactInfoComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
  ) { }

  @Output() savedChanges = new EventEmitter<void>();

  contacts: ContactCard[] | undefined = undefined;

  commonPlatforms = commonPlatforms;
  platformOptions = Object.keys(commonPlatforms);

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.apiService.getJSON<ContactMethod[]>("http://localhost:3000/contact/my_methods")
      .then(methods => {
        this.contacts = methods.map(method => {
          if (this.platformOptions.includes(method.platform)) {
            return ({ platformSelection: method.platform, contactID: method.contactID });
          } else {
            return ({ platformSelection: "Other", customPlatform: method.platform, contactID: method.contactID });
          }
        });
        if (this.contacts.length === 0) {
          this.addCard();
        }
      })
      .catch(err => {
        this.apiService.showErrorPopup(err);
      });
  }

  addCard(): void {
    this.contacts!.push({ platformSelection: "", contactID: "" });
  }

  removeCard(index: number): void {
    const cardToRemove = this.contacts![index];
    this.contacts = this.contacts!.filter(card => (card !== cardToRemove));
  }

  moveUp(index: number): void {
    const current = this.contacts?.[index];
    const neighbor = this.contacts?.[index - 1];
    if (current === undefined || neighbor === undefined || this.contacts === undefined) {
      return;
    }
    this.contacts[index] = neighbor;
    this.contacts[index - 1] = current;
  }

  moveDown(index: number): void {
    this.moveUp(index + 1);
  }

  saveChanges(): void {
    if (this.contacts === undefined) {
      throw "contacts not loaded";
    }
    const methods: ContactMethod[] = [];
    for (const card of this.contacts) {
      const platform = card.platformSelection === "Other" ? card.customPlatform : card.platformSelection;
      const contactID = card.contactID;

      if (!platform) {
        if (this.contacts.length === 1) {
          this.snackBar.open(
            `Cannot save changes: you must provide at least one contact method.`,
            "Dismiss", { "duration": 5000 }
          );
        } else {
          this.snackBar.open(
            `Cannot save changes: missing platform name for ${ordinal(this.contacts.indexOf(card) + 1)} card`,
            "Dismiss", { "duration": 5000 }
          );
        }
        return;
      } else if (!contactID) {
        const platformName = card.platformSelection === "Other" ? card.customPlatform! : card.platformSelection;
        this.snackBar.open(
          `Cannot save changes: missing contact info for ${platformName}`,
          "Dismiss", { "duration": 5000 }
        );
        return;
      }
      methods.push({ platform, contactID });
    }
    this.apiService.putJSON<ContactMethod[], void>("http://localhost:3000/contact/my_methods", methods)
      .then(() => {
        this.snackBar.open(`Your contact info has been updated.`, "Dismiss", { "duration": 5000 });
        this.savedChanges.emit();
        this.loadContacts();
      })
      .catch(err => { this.apiService.showErrorPopup(err); });
  }

}
