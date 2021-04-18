import { Component, OnInit, ViewChild } from '@angular/core';

import { Chart, 
  LineController, 
  BarController, 
  LineElement, 
  BarElement, 
  PointElement, 
  LinearScale, 
  Title, 
  CategoryScale } from 'chart.js';

import { GameService } from '../services/game/game.service';
import { AuthService } from '../services/auth/auth.service';
import { IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  @ViewChild('slides') slides: IonSlides;

  @ViewChild('stackChart') stackChart;
  @ViewChild('changeChart') changeChart;
  @ViewChild('takeChart') takeChart;

  userGameHistory;
  gameNumbers;
  chosenGame;

  stackPoints;
  changePoints;
  takePoints;

  handArray = [];

  constructor(
    private gameService: GameService,
    private authService: AuthService,
    private router: Router
    ) {}

  ngOnInit() {
    this.gameService.getGames().subscribe(res => {
      this.userGameHistory = res;
      this.gameNumbers = Object.keys(res);
      this.gameNumbers = this.gameNumbers.map(function(el) { return parseInt(el)+1 });
      this.chosenGame = this.userGameHistory[1];

      this.handArray = [];

      for (const [index, element] of this.chosenGame["valueArray"].entries()) {
        this.handArray.push(index);
      };
    });
  }

  ionViewDidEnter() {
    Chart.register(LineController, BarController, LineElement, BarElement, PointElement, LinearScale, Title, CategoryScale);
    this.chartStack();
    this.chartChange();
    this.chartTakes();
  }

  updatePoints() {
    this.stackPoints.destroy();
    this.changePoints.destroy();
    this.takePoints.destroy();

    this.chartStack();
    this.chartChange();
    this.chartTakes();
  }

  chartStack() {
    this.stackPoints = new Chart(this.stackChart.nativeElement, {
      type: 'line',
      data: {
        labels: this.handArray,
        datasets: [{
          label: 'Hand',
          data: this.chosenGame['valueArray'],
          backgroundColor: 'var(--ion-color-primary-contrast)',
          borderColor: 'var(--ion-color-light-contrast)',
          borderWidth: 2,
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              color: 'var(--ion-color-light-contrast)',
              text: 'Hand number',
            }
          },
          y: {
            title: {
              display: true,
              color: 'var(--ion-color-light-contrast)',
              text: 'Stack size (£)',
            }
          },
        }
      },
    });
  }

  chartChange() {
    this.changePoints = new Chart(this.changeChart.nativeElement, {
      type: 'line',
      data: {
        labels: this.handArray,
        datasets: [{
          label: 'Hand',
          data: this.chosenGame["changeArray"],
          backgroundColor: 'var(--ion-color-primary-contrast)',
          borderColor: 'var(--ion-color-light-contrast)',
          borderWidth: 2,
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              color: 'var(--ion-color-light-contrast)',
              text: 'Hand number',
            }
          },
          y: {
            title: {
              display: true,
              color: 'var(--ion-color-light-contrast)',
              text: 'Change in stack size (£)',
            }
          },
        }
      },
    });
  }

  chartTakes() {
    this.takePoints = new Chart(this.takeChart.nativeElement, {
      type: 'bar',
      data: {
        labels: [1,2,3,4,5,6,7,8,9,10],
        datasets: [{
          data: this.chosenGame["takeArray"],
          backgroundColor: 'rgba(45,211,111,0.4)',
          borderColor: 'rgba(45,211,111,1)',
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              color: 'var(--ion-color-light-contrast)',
              text: 'Hand number',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              color: 'var(--ion-color-light-contrast)',
              text: 'Hand winnings (£)',
            }
          },
        }
      },
    });
  }

  async unlockAndSlide(direction) {
    var current = await this.slides.getActiveIndex();

    if (direction === "next") {
      this.slides.slideTo(1);
    } else {
      this.slides.slideTo(0); //Only need to slide to beginning
    }
  }

  selectGame(number) {
    this.chosenGame = this.userGameHistory[number - 1];

    this.handArray = [];

    for (const [index, element] of this.chosenGame["valueArray"].entries()) {
      this.handArray.push(index);
    };

    this.updatePoints();
    this.unlockAndSlide('next');
  }

  routeTo(dest) {
    this.router.navigateByUrl(dest);
  }

  onLogout() {
    setTimeout(() => {
      this.router.navigateByUrl("login");
    }, 50);
    this.authService.doLogout();
  }
}
