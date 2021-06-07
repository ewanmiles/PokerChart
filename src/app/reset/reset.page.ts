import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInput } from '@ionic/angular';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.page.html',
  styleUrls: ['./reset.page.scss'],
})
export class ResetPage implements OnInit {
  @ViewChild('password') password: IonInput;
  @ViewChild('error', { read: ElementRef }) error: ElementRef;
  @ViewChild('weak', { read: ElementRef }) weak: ElementRef;

  resetCode: string;

  constructor(
    private router: Router,
    public afAuth: AngularFireAuth
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.resetCode = this.trimURL(window.location.href);
  }

  trimURL(url: string) {
    let codeIndex = url.indexOf("&oobCode");
    let apiIndex = url.indexOf("&apiKey");

    return url.substring(codeIndex + 9, apiIndex); //9 to exclude '&oobCode=', trim for just code
  }

  resetPass() {
    this.error.nativeElement.style.display = "none";
    this.weak.nativeElement.style.display = "none";
    var newPassword = `${this.password.value}`; //Stringify as param has to be str but ioninput can be number

    if (newPassword.length < 8) { //Password too short
      this.weak.nativeElement.style.display = "block";

    } else {
      firebase.auth().confirmPasswordReset(this.resetCode, newPassword)
      .then(() => {
        console.log("Password successfully reset.");
        this.routeTo('login');
      })
      .catch(err => {
        console.log(err);
        this.error.nativeElement.style.display = "block";
      });
    };
  }

  routeTo(dest) {
    this.router.navigateByUrl(dest);
  }
}
