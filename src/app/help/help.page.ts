import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QandAs } from './questions';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {
  QandAs;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    this.QandAs = QandAs;
  }

  routeTo(dest) {
    this.router.navigateByUrl(dest);
  }

}
