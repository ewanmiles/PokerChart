import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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
  @ViewChild('noGames', { read: ElementRef }) noGames: ElementRef;

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
  bestWin: number = 0;
  finalStack: number = 0;
  finalChange: number = 0;
  potPerc: number = 0;

  constructor(
    private gameService: GameService,
    private authService: AuthService,
    private router: Router
    ) {}

  ngOnInit() {
    this.gameService.getGames().subscribe(res => {
      this.userGameHistory = res;
      
      try {
        this.chosenGame = this.userGameHistory[Object.keys(this.userGameHistory)[0]];

        this.handArray = [];

        for (const [index] of this.chosenGame["valueArray"].entries()) {
          this.handArray.push(index);
        };

        this.getBestWin(this.chosenGame["takeArray"]);

        this.finalStack = this.chosenGame["valueArray"][this.chosenGame["valueArray"].length-1];
        this.finalChange = this.finalStack - this.chosenGame["valueArray"][0];
      } catch {
        console.log("No games found!");
      }
    });
  }

  ionViewDidEnter() {
    Chart.register(LineController, BarController, LineElement, BarElement, PointElement, LinearScale, Title, CategoryScale);

    this.slides.lockSwipes(true);

    if (this.userGameHistory.length === 0) {
      this.noGames.nativeElement.style.display = "block";
    } else {
      this.noGames.nativeElement.style.display = "none";
    };
  }

  updatePoints() {
    try {
      this.stackPoints.destroy(); //Replace graphs if already existent
      this.changePoints.destroy();
      this.takePoints.destroy();
    } catch {
      console.log("Starting graphs");
    } finally {
      this.chartStack();
      this.chartChange();
      this.chartTakes();
    }
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
        },
        elements: {
          point: {
            radius: 0,
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
        },
        elements: {
          point: {
            radius: 0,
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
    this.slides.lockSwipes(false);

    if (direction === "next") {
      this.slides.slideTo(1);
    } else {
      this.slides.slideTo(0); //Only need to slide to beginning
    };

    this.slides.lockSwipes(true);
  }

  selectGame(ind) {
    this.chosenGame = this.userGameHistory[ind];

    this.handArray = [];

    for (const [index] of this.chosenGame["valueArray"].entries()) {
      this.handArray.push(index);
    };

    this.potPerc = (this.chosenGame["potsWon"]/this.chosenGame["takeArray"].length)*100

    this.bestWin = 0;
    this.getBestWin(this.chosenGame["takeArray"]);

    this.finalStack = this.chosenGame["valueArray"][this.chosenGame["valueArray"].length-1];
    this.finalChange = this.finalStack - this.chosenGame["valueArray"][0];

    this.updatePoints();
    this.unlockAndSlide('next');
  }

  deleteChosenGame() {
    this.gameService.deleteGame(this.chosenGame.name);

    this.unlockAndSlide('prev');

    setTimeout(() => {
      if (this.userGameHistory.length === 0) {
        this.noGames.nativeElement.style.display = "block";
      };
    }, 50);
  }

  getBestWin(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] > this.bestWin) {
        this.bestWin = arr[i];
      };
    };
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
