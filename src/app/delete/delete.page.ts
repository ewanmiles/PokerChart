import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInput } from '@ionic/angular';
import { AuthService } from '../services/index';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.page.html',
  styleUrls: ['./delete.page.scss'],
})
export class DeletePage implements OnInit {
  @ViewChild('pass') pass: IonInput;
  @ViewChild('incorrect', { read: ElementRef }) incorrect: ElementRef;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
  }

  async deleteAccount() {
    let pass = this.pass.value;
    let auth = await this.authService.attemptAuth(pass);

    if (auth === true) {
      setTimeout(() => {
        this.router.navigateByUrl("login");
      }, 50);
      this.authService.doDelete();
    } else if (auth === false) {
      this.incorrect.nativeElement.style.display = 'flex';
    } else {
      console.log("There was an error.");
    };
  }

  routeTo(dest) {
    this.router.navigateByUrl(dest);
  }
}
