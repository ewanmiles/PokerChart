import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, NavigationExtras } from '@angular/router';
import { IonInput, IonSegment } from '@ionic/angular';
import { RoomService } from '../services/index';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {
  @ViewChild('pass') pass: IonInput;
  @ViewChild('username') username: IonInput;
  @ViewChild('currency') currency: IonSegment;
  @ViewChild('name') name: IonInput;
  @ViewChild('buy') buy: IonInput;
  @ViewChild('buyError', { read: ElementRef }) buyError: ElementRef;

  buyIn: number;
  curr: string = "£";
  date: string;

  constructor(
    private afs: AngularFirestore,
    private router: Router,
    private roomService: RoomService,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.currency.value = "£";
    this.name.value = "";
    this.buy.value = this.curr;
    this.date = new Date().toDateString();
  }

  buildRoom() {
    const newVal = `${this.buy.value}`.replace(this.curr,"");
    this.buyIn = parseFloat(newVal);

    if (Number.isNaN(this.buyIn)) {
      this.buyError.nativeElement.style.display = "flex";
      return "";
    } else {
      let newUID = this.afs.createId();
      let roomID = newUID.slice(0,8);
      const password = this.pass.value;
      const username = `${this.username.value}`;
      
      this.roomService.createRoom([
        roomID, 
        password, 
        username,
        this.name.value,
        this.currency.value,
        this.buyIn,
        this.date
      ]); //Create room - REMEMBER TO UPDATE SERVICE IF ADDING TO THIS

      let data = {
        state: {
          roomID: roomID,
          password: password,
          name: this.name.value,
          curr: this.currency.value,
          buyIn: this.buyIn,
        }
      };

      this.routeWithDataTo('room', data);
    };
  }

  selectCurrency() {
    this.curr = this.currency.value;
    this.buy.value = this.curr;
  }

  removeSlash(event) {
    let newValue = event.target.value;

    if (event.target.value.includes("/")) {
      event.target.value = newValue.slice(0,-1);
    };
  }

  stopRemoveCurr(event) {
    let newValue = event.target.value;
    
    if (!event.target.value.includes(this.curr)) {
      event.target.value = this.curr + newValue
    };
  }

  routeWithDataTo(dest, data) {
    let navExtras: NavigationExtras = data;
    this.router.navigate([dest], navExtras);
  }

  routeTo(dest) {
    this.router.navigateByUrl(dest);
  }
}
