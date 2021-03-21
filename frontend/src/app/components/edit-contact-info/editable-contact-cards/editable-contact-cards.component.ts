import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactMethod } from 'boop-core';
import { ordinal } from 'src/app/util/ordinal';
import { commonPlatforms } from 'src/app/util/platforms';

export type EditableContactCard = {
  platformSelection: string;
  customPlatform?: string; // set if platformSelection is "Other"
  contactID: string;
};

@Component({
  selector: 'app-editable-contact-cards',
  templateUrl: './editable-contact-cards.component.html',
  styleUrls: ['./editable-contact-cards.component.scss']
})
export class EditableContactCardsComponent implements OnInit {

  @Input() contacts: EditableContactCard[] = [];
  @Output() confirmChanges = new EventEmitter<ContactMethod[]>();

  commonPlatforms = commonPlatforms;
  platformOptions = Object.keys(commonPlatforms);

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    if (this.contacts.length === 0) {
      this.contacts.push({ platformSelection: "", contactID: "" });
    }
  }

  addCard(): void {
    this.contacts.push({ platformSelection: "", contactID: "" });
  }

  removeCard(index: number): void {
    const cardToRemove = this.contacts[index];
    this.contacts = this.contacts.filter(card => (card !== cardToRemove));
  }

  moveUp(index: number): void {
    const safeIndexedContacts: {[index: number]: EditableContactCard | undefined;} = this.contacts;
    const current = safeIndexedContacts[index];
    const neighbor = safeIndexedContacts[index - 1];
    if (current === undefined || neighbor === undefined) {
      return;
    }
    this.contacts[index] = neighbor;
    this.contacts[index - 1] = current;
  }

  moveDown(index: number): void {
    this.moveUp(index + 1);
  }

  confirm(): void {
    const methods: ContactMethod[] = [];
    for (const card of this.contacts) {
      const platform = card.platformSelection === "Other" ? card.customPlatform : card.platformSelection;
      const contactID = card.contactID;

      if (!platform) {
        if (this.contacts.length === 1) {
          this.snackBar.open(
            `You must provide at least one contact method.`,
            "Dismiss", { "duration": 5000 }
          );
        } else {
          this.snackBar.open(
            `Missing platform name for ${ordinal(this.contacts.indexOf(card) + 1)} card`,
            "Dismiss", { "duration": 5000 }
          );
        }
        return;
      } else if (!contactID) {
        const platformName = card.platformSelection === "Other" ? card.customPlatform! : card.platformSelection;
        this.snackBar.open(
          `Missing contact info for ${platformName}`,
          "Dismiss", { "duration": 5000 }
        );
        return;
      }
      methods.push({ platform, contactID });
    }
    this.confirmChanges.emit(methods);
  }

}
