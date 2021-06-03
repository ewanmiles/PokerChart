import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonInput } from '@ionic/angular';
import firebase from 'firebase/app';
import { Router } from '@angular/router';
import { UsersService } from '../services/index';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  @ViewChild('oldName', { read: ElementRef }) oldNameText: ElementRef;
  @ViewChild('newName', { read: ElementRef }) newNameText: ElementRef;
  @ViewChild('nameInput') nameInput: IonInput;

  uid: string;
  userDetails;
  gameNumber: number;
  potWinPerc: number;

  constructor(
    private usersService: UsersService,
    private router: Router
  ) { 
    this.uid = firebase.auth().currentUser.uid;
    this.usersService.getUserDetails(this.uid).subscribe(res => {
      this.userDetails = res;
    });
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.potWinPerc = (this.userDetails.potsWon/this.userDetails.handsPlayed)*100;
  }

  showRenameInput() {
    this.oldNameText.nativeElement.style.display = "none";
    this.newNameText.nativeElement.style.display = "flex";
  }

  renameGame() {
    var newName = this.nameInput.value;
    var oldName = this.userDetails.name;
    
    this.usersService.changeName(newName, this.uid);
    
    setTimeout(() => {
      this.oldNameText.nativeElement.style.display = "flex";
      this.newNameText.nativeElement.style.display = "none";
    }, 100);
  }

  routeTo(dest) {
    this.router.navigateByUrl(dest);
  }
}
