import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { UsersService } from '../services';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  foundTags: Array<string | number> = [];
  userToView;

  constructor(
    private usersService: UsersService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  async searchForUsers(event) {
    if (event.target.value.length < 2) { //Don't let it search with a very small string so it doesn't waste data
      this.foundTags = [];
    } else {
      var results = await this.usersService.listUsersByTag(event.target.value);
      this.foundTags = results //Will update options on template
    };
  }

  goToAcct(value) {
    this.userToView = {
      state: {
        tag: `${value}`
      }
    };

    this.routeWithDataTo('account', this.userToView);
  }

  routeTo(dest) {
    this.router.navigateByUrl(dest);
  }

  routeWithDataTo(dest, data) {
    let navExtras: NavigationExtras = data;
    this.router.navigate([dest], navExtras);
  }


}
