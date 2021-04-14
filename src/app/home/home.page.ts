import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonInput, IonButton, IonContent } from '@ionic/angular';
import { Chart, 
  LineController, 
  BarController, 
  LineElement, 
  BarElement, 
  PointElement, 
  LinearScale, 
  Title, 
  CategoryScale } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('take', { read: ElementRef }) changeInput: ElementRef;
  @ViewChild('take') change: IonInput;
  @ViewChild('buyScreen', { read: ElementRef }) buyScreen: ElementRef;
  @ViewChild('buy') buy: IonInput;
  @ViewChild('buyError', { read: ElementRef }) buyError: ElementRef;
  @ViewChild('changeError', { read: ElementRef }) changeError: ElementRef;
  @ViewChild('slide', { read: ElementRef }) slideDown: ElementRef;
  @ViewChild('submit') submit: IonButton;
  @ViewChild(IonContent) frame: IonContent;

  @ViewChild('stackChart') stackChart;
  @ViewChild('changeChart') changeChart;
  @ViewChild('takeChart') takeChart;

  handArray: Array<number> = [];
  valueArray: Array<number> = [];
  changeArray: Array<number> = [];
  takeArray: Array<number> = [];
  stackSize;
  buyIn;
  hand: number;
  take: number;
  changeType: string;
  percChange: number = 0;
  topTakes: Array<number> = [];
  takeNumber: number = 0;
  avgChange: number = 0;
  peakStack: number = 0;

  stackPoints;
  changePoints;
  takePoints;

  constructor() {}

  ngOnInit() {}

  ionViewDidEnter() {
    Chart.register(LineController, BarController, LineElement, BarElement, PointElement, LinearScale, Title, CategoryScale);
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
          data: this.valueArray,
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
          data: this.changeArray,
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
          data: this.takeArray,
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

  quickAvg(arr) {
    /** 
     * ES6 average method, input
     * arr (arr): Array of values to be averaged
    **/
    return arr.reduce((p,c) => p + c, 0)/arr.length;
  }

  startGame() {
    this.hand = 0;
    this.buyIn = parseFloat(`${this.buy.value}`);

    if (Number.isNaN(this.buyIn)) {
      this.buyError.nativeElement.style.display = "flex";
    } else {
      this.buyError.nativeElement.style.display = "none";

      this.valueArray.push(this.buyIn);
      this.stackSize = this.buyIn.toFixed(2);
      this.handArray.push(this.hand);
      this.changeArray.push(0);
      this.peakStack = this.buyIn;

      this.stackPoints.update();
      this.changePoints.update();
      this.takePoints.update();

      this.buyScreen.nativeElement.style.transform = "translate(0vw, 70vh)";
      setTimeout(() => {this.buyScreen.nativeElement.style.display = "none"}, 700);

      this.frame.scrollToTop(300);
    }
  }

  showInput(type) {
    //Get height of hidden content
    var hiddenDiv = document.getElementById('hidden');
    var hiddenHeight = hiddenDiv.getBoundingClientRect().height;

    this.changeType = type;
    this.slideDown.nativeElement.style.transform = `translate(0vw, ${hiddenHeight + 10}px)`; //Slide height of hidden content plus wiggle room

    if (type === "loss") {
      this.changeInput.nativeElement.style.border = "solid 2px var(--ion-color-danger)";
      this.slideDown.nativeElement.style.borderTop = "solid 2px var(--ion-color-danger)";
    } else if (type === "gain") {
      this.changeInput.nativeElement.style.border = "solid 2px var(--ion-color-success)";
      this.slideDown.nativeElement.style.borderTop = "solid 2px var(--ion-color-success)";
    };
  }

  submitChange() {
    this.take = parseFloat(`${this.change.value}`);

    if (Number.isNaN(this.take)) {
      this.changeError.nativeElement.style.display = "flex"; //this has to come first or hidden height doesn't change

      //Get new height of hidden content including error message
      var hiddenDiv = document.getElementById('hidden');
      var hiddenHeight = hiddenDiv.getBoundingClientRect().height;

      this.slideDown.nativeElement.style.transform = `translate(0vw, ${hiddenHeight + 20}px)`;
    } else {
      this.slideDown.nativeElement.style.transform = "translate(0vw, 0vh)";
      this.slideDown.nativeElement.style.borderTop = "solid 2px var(--ion-color-primary)";
      this.change.value = null;
      this.hand ++;
      this.handArray.push(this.hand);

      if (this.changeType === 'loss') {
        this.countLoss();
      } else if (this.changeType === 'gain') {
        this.countGain();
      };

      this.avgChange = this.quickAvg(this.changeArray.slice(1,this.changeArray.length));
      this.peakStack = this.valueArray.reduce(function(a,b) { return Math.max(a,b) });

      if (this.changeArray.length > 10) {
        this.takeNumber = 10;
      } else {
        this.takeNumber = this.changeArray.length-1;
      }

      this.takeArray.sort((a,b) => {return b-a});
    
      this.stackPoints.update();
      this.changePoints.update();
      this.takePoints.update();
    }
  }

  countLoss() {
    this.stackSize = parseFloat(this.stackSize);
    this.stackSize -= this.take;

    this.percChange = 100 * ((this.stackSize/this.buyIn) - 1);

    this.valueArray.push(this.stackSize);
    this.changeArray.push(0-this.take);
    this.takeArray.push(0-this.take);

    this.stackSize = this.stackSize.toFixed(2);
  }

  countGain() {
    this.stackSize = parseFloat(this.stackSize);
    this.stackSize += this.take;

    this.percChange = 100 * ((this.stackSize/this.buyIn) - 1);

    this.valueArray.push(this.stackSize);
    this.changeArray.push(this.take);
    this.takeArray.push(this.take);

    this.stackSize = this.stackSize.toFixed(2);
  }
}
