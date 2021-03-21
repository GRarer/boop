import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactMethod } from 'boop-core';
import { ApiService } from 'src/app/services/api.service';
import { commonPlatforms } from 'src/app/util/platforms';
import { EditableContactCard } from './editable-contact-cards/editable-contact-cards.component';

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

  contacts: EditableContactCard[] | undefined = undefined;

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.apiService.getJSON<ContactMethod[]>("contact/my_methods")
      .then(methods => {
        this.contacts = methods.map(method => {
          if (Object.keys(commonPlatforms).includes(method.platform)) {
            return ({ platformSelection: method.platform, contactID: method.contactID });
          } else {
            return ({ platformSelection: "Other", customPlatform: method.platform, contactID: method.contactID });
          }
        });
      })
      .catch(err => {
        this.apiService.showErrorPopup(err);
      });
  }

  saveChanges(methods: ContactMethod[]): void {
    this.apiService.putJSON<ContactMethod[], void>("contact/my_methods", methods)
      .then(() => {
        this.snackBar.open(`Your contact info has been updated.`, "Dismiss", { "duration": 5000 });
        this.loadContacts();
      })
      .catch(err => { this.apiService.showErrorPopup(err); });
  }
}
