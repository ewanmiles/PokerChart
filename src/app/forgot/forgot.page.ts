import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInput } from '@ionic/angular';
import firebase from 'firebase/app';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
})
export class ForgotPage implements OnInit {
  @ViewChild('email') email: IonInput;
  @ViewChild('success', { read: ElementRef }) success: ElementRef;
  @ViewChild('fail', { read: ElementRef }) fail: ElementRef;
  @ViewChild('incorrect', { read: ElementRef }) incorrect: ElementRef;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  sendReset() {
    this.success.nativeElement.style.display = "none"; //Clear any present error/success messages
    this.fail.nativeElement.style.display = "none";
    this.incorrect.nativeElement.style.display = "none";

    try {
      firebase.auth().sendPasswordResetEmail(`${this.email.value}`)
        .then(() => {
          this.success.nativeElement.style.display = "flex";
        })
        .catch(err => {
          console.log(err);
          if (err.code === "auth/invalid-email") {
            this.incorrect.nativeElement.style.display = "flex";
          } else {
            this.fail.nativeElement.style.display = "flex";
          };
        });
    } catch { //Error with firebase.auth() i.e. catch above not executed
      this.fail.nativeElement.style.display = "flex";
    };
  }

  routeTo(dest) {
    this.router.navigateByUrl(dest);
  }
}
