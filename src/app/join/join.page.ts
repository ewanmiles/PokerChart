import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { IonInput } from '@ionic/angular';
import { RoomService } from '../services/room/room.service';
import firebase from 'firebase/app';

@Component({
  selector: 'app-join',
  templateUrl: './join.page.html',
  styleUrls: ['./join.page.scss'],
})
export class JoinPage implements OnInit {
  @ViewChild('key') key: IonInput;
  @ViewChild('pass') pass: IonInput;
  @ViewChild('username') username: IonInput;

  @ViewChild('error', { read: ElementRef }) error: ElementRef;
  @ViewChild('errorMsg', { read: ElementRef }) errorMsg: ElementRef;

  initialRoomData;
  dataToPass;
  uid;

  constructor(
    private router: Router,
    private roomService: RoomService,
  ) {
    this.uid = firebase.auth().currentUser.uid;
   }

  ngOnInit() {
  }

  joinGame() {
    const sub = this.roomService.joinRoom(this.key.value, this.pass.value, `${this.username.value}`).subscribe(res => {
      if (res === undefined) {
        this.errorMsg.nativeElement.innerHTML = "You have entered a key that doesn't exist, please enter a valid room key."
        this.error.nativeElement.style.display = "flex";

      } else if (this.pass.value != res.password) {
        this.errorMsg.nativeElement.innerHTML = "You have entered an incorrect password for that room.";
        this.error.nativeElement.style.display = "flex";

      } else {
        this.initialRoomData = res;
        let beforeUsers = this.initialRoomData.users;
        let beforeUserNames = this.initialRoomData.usernames;

        if(!beforeUsers.includes(this.uid)) { //If this user not already in room, add their id and username and push to database
          beforeUsers.push(this.uid);
          beforeUserNames.push(`${this.username.value}`);

          this.roomService.roomsCollection.doc(`${this.key.value}`).update({
            users: beforeUsers,
            usernames: beforeUserNames
          })
          .catch((error) => {
            console.log(error);
          });
        };

        this.dataToPass = {
          state: {
            roomID: `${this.key.value}`,
          }
        };

        //this.routeWithDataTo('room',data);
      };
    });

    setTimeout(() => {
      this.routeWithDataTo('room', this.dataToPass);
      sub.unsubscribe();
    }, 500);
  }

  routeWithDataTo(dest, data) {
    let navExtras: NavigationExtras = data;
    this.router.navigate([dest], navExtras);
  }

}
