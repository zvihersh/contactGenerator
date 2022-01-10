import { Component } from '@angular/core';
import { Contact } from './models/contact-model';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { DeleteContactDialogComponent } from './components/delete-contact-dialog/delete-contact-dialog.component'; 
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  contacts: Contact[] = [];
  title = 'contact-generator';
  tempProfileImage: SafeHtml = '';

  username = '';
  searchChanged$ = new Subject();
  typing = false;
  generatingUser = false;
  draftContact: Contact;
  showDuplicateError = false;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, public dialog: MatDialog) {
    this.draftContact = new Contact('', '', '', '', '');
    this.searchChanged$.pipe(debounceTime(2000)).subscribe((res: any) => {
      this.typing = false;
      this.http.get(`https://avatars.dicebear.com/api/bottts/${res}.svg`, {responseType: 'text' as const}).subscribe((avatar: any) => {
        this.tempProfileImage = this.sanitizer.bypassSecurityTrustHtml(avatar);
        this.draftContact.imageUrl = this.tempProfileImage;
        console.log(avatar)
      });
    });
    const c = localStorage.getItem('contacts');
    if (c) {
      this.contacts = JSON.parse(c);
      this.contacts.forEach(c => c.imageUrl = this.sanitizer.bypassSecurityTrustHtml((c as any).imageUrl.changingThisBreaksApplicationSecurity));
    }
    console.log(c);
  }

  changed(ev: any) {
    this.showDuplicateError = false;
    if (!ev || !ev.target) {
      return;
    }
    const val = ev.target.value;
    this.username = val;
    this.draftContact.username = this.username;
    if (!val) {
      this.tempProfileImage = '';
      this.draftContact.imageUrl = '';
      return;
    }
    this.typing = true;
    this.searchChanged$.next(val);
  }

  startUserGeneration(input: HTMLInputElement) {
    if (!this.username) {
      return;
    }
    if (this.contacts.find(c => c.username === this.username)) {
      this.showDuplicateError = true;
      console.log('dup');
      return;
    }
    this.generatingUser = true;
    this.http.get(`https://randomuser.me/api/?seed=${this.username}`).subscribe((user: any) => {
      const email = user?.results[0]?.email;
      const firstName = user?.results[0]?.name?.first;
      const lastName = user?.results[0]?.name?.last;
      if (email && firstName && lastName) {
        this.contacts.push(new Contact(this.username, this.tempProfileImage, firstName, lastName, email));
        // if onload speed is not important (and memory size is)
        // you can save only the seeds and download the avatars again on load (same as the user details)
        localStorage.setItem('contacts', JSON.stringify(this.contacts));
      }
      this.draftContact.username = '';
      this.draftContact.imageUrl = '';
      this.username = '';
      this.tempProfileImage = '';
      this.generatingUser = false;
      input.value = '';
    });
  }

  contactClicked(contact: Contact) {
    this.openDialog(contact);
  }

  openDialog(contact: Contact): void {
    const dialogRef = this.dialog.open(DeleteContactDialogComponent, {
      width: '250px',
      data: {name: contact.firstName + ' ' + contact.lastName},
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result === 'YES') {
        this.contacts = this.contacts.filter(c => c.username !== contact.username);
        localStorage.setItem('contacts', JSON.stringify(this.contacts));
      }
    });
  }
}