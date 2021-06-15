import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { Router } from "@angular/router";
import { IonSegment } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('logtype') segment: IonSegment;
  @ViewChild('register', { read: ElementRef }) register: ElementRef;
  @ViewChild('login', { read: ElementRef }) login: ElementRef;

  errorMsg: string;
  error: boolean = false;

  usersCollection;

  signupForm = new FormGroup({
    name: new FormControl("", [
      Validators.required,
      Validators.pattern("[a-zA-Z -]*")
    ]),
    tag: new FormControl("", [
      Validators.required,
      Validators.pattern("[a-zA-Z -]*"),
      Validators.minLength(2),
      Validators.maxLength(10)
    ]),
    email: new FormControl("", [
      Validators.required,
      Validators.email,
      Validators.pattern("[a-zA-Z0-9_.]*@[a-zA-Z0-9]*.[a-zA-Z0-9_.]*"),
    ]),
    password: new FormControl("", [
      Validators.required,
      Validators.pattern("[a-zA-Z0-9_.]*"),
      Validators.minLength(8)
    ]),
  });

  loginForm = new FormGroup({
    email: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private afs: AngularFirestore
    ) {
      this.usersCollection = this.afs.collection('users');
    }

  ngOnInit() {}

  ngAfterViewInit() {
    this.segment.value = "register";
    this.changeDisplay();
  }

  changeDisplay() {
    this.login.nativeElement.style.display = "none"
    this.register.nativeElement.style.display = "none"

    if (this.segment.value === "login") {
      this.login.nativeElement.style.display = "block"
    } else if (this.segment.value === "register") {
      this.register.nativeElement.style.display = "block"
    }
  }

  async onLogin() {
    let errors = {
      "email": "You have entered and incorrect email.",
      "disabled": "Your account has been disabled, likely for security reasons.",
      "notFound": "There is no account attached to that email, please register an account.",
      "password": "You have entered an incorrect password.",
      "unknown": "Something went wrong, please try again later.",
    }
    var value = this.loginForm.controls;

    var res = await this.authService.doLogin(value);

    if (res === "success") {
      console.log("Successful login.");
      this.router.navigateByUrl("history");
    } else {
      this.errorMsg = errors[res];
      this.error = true;
    }
  }

  async onSubmit() {
    let errors = {
      "emailUsed": "That email is already linked to an account on this app. If it is your email, please sign in with the password previously used.",
      "emailInvalid": "That email is not valid, please enter a valid email.",
      "password": "That password is too weak, please enter a stronger password.",
      "unknown": "Something went wrong, please try again later.",
      "tagTaken": "That tag has already been taken by another user, try a different tag."
    }

    var value = this.signupForm.controls;

    var snapshot = await this.usersCollection.ref
      .where('tag', '==', value.tag.value.toLowerCase()).get();

    var names = [];
    snapshot.forEach(doc => {
      names.push(doc.data().tag);
    }); //All accounts with this tag if they exist

    if (names.length > 0) {
      this.errorMsg = errors['tagTaken'];
      this.error = true;
      return "";
    }

    var res = await this.authService.doRegister(value);
    
    if (res === "success") {
      this.router.navigateByUrl("history");
    } else {
      this.errorMsg = errors[res];
      this.error = true;
    }
  }

  routeTo(dest) {
    this.router.navigateByUrl(dest);
  }
}
