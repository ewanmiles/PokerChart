import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonInput } from '@ionic/angular';
import firebase from 'firebase/app';
import { ActivatedRoute, Router } from '@angular/router';
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

  viewUid: string;
  userUid: string;
  userDetails;
  gameNumber: number;
  potWinPerc: number;

  routerData;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.routerData = this.router.getCurrentNavigation().extras.state;
      }
    });
  }

  async ngOnInit() {
    firebase.auth().onAuthStateChanged(user => { 
      if (user) {
        this.userUid = user.uid; 
        console.log("USER:", this.userUid)
      }
    });

    let ss = await this.usersService.findUserUID(this.routerData.tag);
    this.viewUid = ss[0];

    this.usersService.getUserDetails(this.viewUid).subscribe(res => {
      console.log("Subscribing to user details.");
      this.userDetails = res;
      this.potWinPerc = (this.userDetails.potsWon/this.userDetails.handsPlayed)*100
    });
  }

  showRenameInput() {
    this.oldNameText.nativeElement.style.display = "none";
    this.newNameText.nativeElement.style.display = "flex";
  }

  renameGame() {
    var newName = this.nameInput.value;
    var oldName = this.userDetails.name;
    
    this.usersService.changeName(newName, this.viewUid);
    
    setTimeout(() => {
      this.oldNameText.nativeElement.style.display = "flex";
      this.newNameText.nativeElement.style.display = "none";
    }, 100);
  }

  routeTo(dest) {
    this.router.navigateByUrl(dest);
  }
}
