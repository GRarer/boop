import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonPlatforms, ContactMethod } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';

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

  contacts: ContactCard[] | undefined = undefined;

  platformOptions = CommonPlatforms;

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.apiService.getJSON<ContactMethod[]>("http://localhost:3000/contact/my_methods")
      .then(methods => {
        console.log(methods);
        this.contacts = methods.map(method => {
          if (this.platformOptions.includes(method.platform)) {
            return ({ platformSelection: method.platform, contactID: method.contactID });
          } else {
            return ({ platformSelection: "Other", customPlatform: method.platform, contactID: method.contactID });
          }
        });
        console.log(this.contacts);
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
        this.snackBar.open(
          `Cannot save changes: missing platform for card ${this.contacts.indexOf(card) + 1}`,
          "Dismiss", { "duration": 5000 }
        );
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
    console.log(methods);
    this.apiService.putJSON<ContactMethod[], void>("http://localhost:3000/contact/my_methods", methods)
      .then(() => {
        this.snackBar.open(`Your contact info has been updated.`, "Dismiss", { "duration": 5000 });
        this.loadContacts();
      })
      .catch(err => { this.apiService.showErrorPopup(err); });
  }

}
