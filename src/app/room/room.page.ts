import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInput, IonButton } from '@ionic/angular';
import { RoomService } from '../services/room/room.service';
import firebase from 'firebase/app';
import { GameService } from '../services/game/game.service';
import { Chart, 
  LineController, 
  BarController, 
  LineElement, 
  BarElement, 
  PointElement, 
  LinearScale, 
  Title, 
  CategoryScale } from 'chart.js';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { UsersService } from '../services/users/users.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {
  @ViewChild('take', { read: ElementRef }) changeInput: ElementRef;
  @ViewChild('take') change: IonInput;
  @ViewChild('changeError', { read: ElementRef }) changeError: ElementRef;

  @ViewChild('slide', { read: ElementRef }) slideDown: ElementRef;
  @ViewChild('head', { read: ElementRef }) head: ElementRef;

  @ViewChild('buttons', { read: ElementRef }) buttons: ElementRef;
  @ViewChild('submit') submit: IonButton;

  @ViewChild('stackChart') stackChart;
  @ViewChild('changeChart') changeChart;
  @ViewChild('takeChart') takeChart;

  @ViewChildren('names', { read: ElementRef }) names: QueryList<ElementRef>;

  routerData;
  roomData;
  myData;
  valueData;
  changeData;
  uid;
  userDetails;

  observedValues;

  changeType: string;

  handArray: Array<number> = [];
  hand: number;
  takeArrayOrdered: Array<number> = [];

  stackSize;
  take: number;
  percChange: number = 0;
  topTakes: Array<number> = [];
  takeNumber: number = 0;

  //More stats
  totalChange: number = 0;
  potPerc: number = 0;

  stackPoints;
  changePoints;
  takePoints;

  roomSub: Subscription;

  colorMap = {
    0: '#000000',
    1: '#FF0000',
    2: '#00FF00',
    3: '#0000FF',
    4: '#FFFF00',
    5: '#00FFFF',
    6: '#FF00FF',
    7: '#FF8D6C',
    8: '#85510D',
    9: '#4A51FF'
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roomService: RoomService,
    private gameService: GameService,
    private authService: AuthService,
    private usersService: UsersService
  ) { 
    this.uid = firebase.auth().currentUser.uid;

    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.routerData = this.router.getCurrentNavigation().extras.state;
      }
    });

    this.authService.getUserDetails(this.uid).subscribe(res => {
      this.userDetails = res;
    });
  }

  ngOnInit() {
    this.roomSub = this.roomService.getRoom(this.routerData.roomID).subscribe(res => {
      this.roomData = res;
      this.stackSize = this.roomData.buyIn; //Throws an error on close? Can't move this out of subscription
      this.stackSize = this.stackSize.toFixed(2);

      if (this.roomData.users.length != 0) {
        setTimeout(() => {
          this.styleNames();
        }, 500);
      };
    });

    this.roomService.getGraphValueData(this.routerData.roomID).subscribe(res => {
      this.valueData = res;
    });
    this.roomService.getGraphChangeData(this.routerData.roomID).subscribe(res => {
      this.changeData = res;
    });

    this.hand = 0;
    this.handArray.push(this.hand);
  }

  ionViewDidEnter() {
    this.positionSlide();

    let ind = this.roomData.users.indexOf(this.uid);
    let username = this.roomData.usernames[ind];

    this.myData = { //Initialise this user's game data
      avgChange: 0,
      bestWin: 0,
      changeArray: [0],
      curr: this.roomData.curr,
      name: this.roomData.name,
      username: username,
      peakStack: this.roomData.buyIn,
      potsWon: 0,
      preFolds: 0,
      takeArray: [],
      valueArray: [this.roomData.buyIn]
    } // IF YOU ADD TO THIS MAKE SURE TO UPDATE THE SERVICE

    this.roomService.createUserCollection(this.routerData.roomID, this.uid, this.myData);

    Chart.register(LineController, BarController, LineElement, BarElement, PointElement, LinearScale, Title, CategoryScale);
    this.chartStack();
    this.chartChange();
    this.chartTakes();

    setTimeout(() => { 
      if (this.valueData[this.myData.username] === undefined) {
        let index = Object.keys(this.valueData).length;
        this.roomService.updateGraphData(this.routerData.roomID, 'valueArray', {
          [this.myData.username]: {
            data: this.myData.valueArray,
            _color: this.colorMap[index]
          }
        });
        this.roomService.updateGraphData(this.routerData.roomID, 'changeArray', {
          [this.myData.username]: {
            data: this.myData.changeArray,
            _color: this.colorMap[index]
          }
        });
      };

      setTimeout(() => {this.styleNames();}, 200); //I know timeout within timeout is awful, but it works, gotta let database update
    }, 200);

    this.updateCharts();
  }

  styleNames() {
    var els = Array.from(this.names);
    setTimeout(() => { els.forEach(element => {
      element.nativeElement.style.color = `${this.valueData[element.nativeElement.innerHTML]["_color"]}`;
    });
    }, 400);
  }

  formObservable(data) {
    let displayData = [];
    
    for (let i = 0; i<Object.keys(data).length; i++) {
      let name = Object.keys(data)[i];
      let obj = {
        label: name,
        data: data[name]["data"],
        backgroundColor: 'var(--ion-color-primary-contrast)',
        borderColor: data[name]["_color"],
        borderWidth: 2,
      };

      displayData.push(obj);
    }

    return displayData;
  }

  chartStack() {
    this.stackPoints = new Chart(this.stackChart.nativeElement, {
      type: 'line',
      data: {
        labels: this.handArray,
        datasets: this.formObservable(this.valueData),
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
        datasets: this.formObservable(this.changeData),
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
          data: this.myData.takeArray,
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

  positionSlide() {
    var headTop = this.head.nativeElement.getBoundingClientRect().height;
    var buttonsTop = this.buttons.nativeElement.getBoundingClientRect().height;

    this.slideDown.nativeElement.style.top = `${headTop + buttonsTop + 38}px` //27 is manual positioning due to other content
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

      this.myData.avgChange = this.quickAvg(this.myData.changeArray.slice(1,this.myData.changeArray.length));
      this.myData.peakStack = this.myData.valueArray.reduce(function(a,b) { return Math.max(a,b) });

      if (this.myData.changeArray.length > 10) {
        this.takeNumber = 10;
      } else {
        this.takeNumber = this.myData.changeArray.length-1;
      }

      this.myData.takeArray.sort((a,b) => {return b-a});

      this.roomService.updateUserCollection(this.routerData.roomID, this.uid, this.myData); //Push to database

      let color = this.valueData[this.myData.username]["_color"];
      this.roomService.updateGraphData(this.routerData.roomID, 'valueArray', {
        [this.myData.username]: {
          data: this.myData.valueArray,
          _color: color
        }
      });
      this.roomService.updateGraphData(this.routerData.roomID, 'changeArray', {
        [this.myData.username]: {
          data: this.myData.changeArray,
          _color: color
        }
      });

      this.gameService.addGroupGame(this.roomData.name, this.myData);

      setTimeout(() => {
        this.updateStats();
        this.updateCharts();
      }, 300);
    }
  }

  undoLastMove() {
    if (this.hand === 0) {
      return "";
    };

    this.stackSize -= this.takeArrayOrdered[this.takeArrayOrdered.length-1];
    this.hand --;

    this.undoStats();
    
    this.percChange = 100 * ((this.stackSize/this.roomData.buyIn) - 1);
    this.myData.valueArray.splice(-1,1);
    this.myData.changeArray.splice(-1,1);
    this.takeArrayOrdered.splice(-1,1);

    this.take = this.takeArrayOrdered[this.takeArrayOrdered.length-1];

    var mutable = [...this.takeArrayOrdered];

    this.myData.takeArray = [...mutable.sort((a,b) => {return b-a})];

    this.handArray.splice(-1,1);

    if (this.hand == 0) {
      this.myData.avgChange = 0;
    } else {
      this.myData.avgChange = this.quickAvg(this.myData.changeArray.slice(1,this.myData.changeArray.length));
    };

    this.myData.peakStack = this.myData.valueArray.reduce(function(a,b) { return Math.max(a,b) });

    if (this.myData.changeArray.length > 10) {
      this.takeNumber = 10;
    } else {
      this.takeNumber = this.myData.changeArray.length-1;
    }

    this.myData.takeArray.sort((a,b) => {return b-a});

    this.stackSize = this.stackSize.toFixed(2);

    if (this.myData.takeArray.length > 0) {
      var takeToPush: number | string = this.myData.takeArray[0].toFixed(2);
    } else {
      takeToPush = 0;
    };

    this.roomService.updateUserCollection(this.routerData.roomID, this.uid, this.myData); //Push to database

    setTimeout(() => {this.updateCharts();}, 300);
  }

  countLoss() {
    this.stackSize = parseFloat(this.stackSize);
    this.stackSize -= this.take;

    this.percChange = 100 * ((this.stackSize/this.roomData.buyIn) - 1);

    this.myData.valueArray.push(this.stackSize);
    this.myData.changeArray.push(0-this.take);
    this.myData.takeArray.push(0-this.take);
    this.takeArrayOrdered.push(0-this.take);

    this.stackSize = this.stackSize.toFixed(2);
  }

  countGain() {
    this.stackSize = parseFloat(this.stackSize);
    this.stackSize += this.take;

    this.percChange = 100 * ((this.stackSize/this.roomData.buyIn) - 1);

    this.myData.valueArray.push(this.stackSize);
    this.myData.changeArray.push(this.take);
    this.myData.takeArray.push(this.take);
    this.takeArrayOrdered.push(this.take);

    this.stackSize = this.stackSize.toFixed(2);
  }

  updateCharts() {
    this.stackPoints.destroy();
    this.changePoints.destroy();

    this.chartStack();
    this.chartChange();

    this.takePoints.update();
  }

  updateStats() {
    var last = this.takeArrayOrdered[this.takeArrayOrdered.length - 1];
    if (last === 0) {
      this.myData.preFolds ++;
    } else if (last > 0) {
      this.myData.potsWon ++;
    }

    this.potPerc = (this.myData.potsWon/this.hand)*100;
    this.totalChange = this.stackSize - this.roomData.buyIn;
  }

  undoStats() {
    var last = this.takeArrayOrdered[this.takeArrayOrdered.length - 1];
    if (last === 0) {
      this.myData.preFolds --;
    } else if (last > 0) {
      this.myData.potsWon --;
    };

    this.potPerc = (this.myData.potsWon/this.hand)*100;
    this.totalChange = this.stackSize - this.roomData.buyIn;
  }

  leaveRoom() {
    this.usersService.updateUserStats(
      this.uid,
      [
        this.myData.potsWon,
        this.myData.takeArray[0],
        [...this.myData.takeArray]
      ]
    );
    
    if (this.myData.takeArray.length > 0) {
      var oldGameNo = this.userDetails.games;
      this.authService.updateGameNumber(this.uid, oldGameNo+1);
    };
    
    let u = [];
    let uN = [];
    this.roomData.users.forEach(el => {
      if (el != this.uid) {
        u.push(el);
      };
    });
    this.roomData.usernames.forEach(el => {
      if (el != this.myData.username) {
        uN.push(el);
      };
    });

    console.log('Updating room users...');
    console.log('User arrays:', u, uN);

    if (u.length < 1) {
      this.routeTo('history');
      this.roomSub.unsubscribe();
      setTimeout(() => {this.roomService.closeRoom(this.routerData.roomID);}, 200);
    } else {
      this.routeTo('history');
      this.roomSub.unsubscribe();
      this.roomService.updateRoomUsers(this.routerData.roomID, u, uN);
    }
  }

  routeTo(dest) {
    this.router.navigateByUrl(dest);
  }

}
