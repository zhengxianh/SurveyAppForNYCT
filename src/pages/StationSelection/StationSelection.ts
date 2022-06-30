import { Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';

import { enableProdMode } from '@angular/core';
enableProdMode();


@Component({
  selector: 'page-StationSelection',
  templateUrl: 'StationSelection.html'
})

export class StationSelectionPage {
  private _dapDictionary = {};
  private stationList = [];
  private trainList = [];
  private stationRoute = {};
  private List1 = [];
  private List2 = [];
  private List3 = [];
  private List4 = [];
  private List5 = [];
  private List6 = [];
  private List7 = [];
  private List8 = [];
  private List9 = [];
  private List10 = [];
  private List11 = [];
  private List12 = [];
  private List13 = [];
  private List14 = [];
  private List15 = [];
  private List16 = [];
  private List17 = [];
  private List18 = [];
  private List19 = [];
  private List20 = [];
  private List21 = [];
  private List22 = [];
  private List23 = [];
  private List24 = [];
  private List25 = [];
  private List26 = [];
  private List27 = [];
  private List = 1;

  constructor(private navParams: NavParams, public navCtrl: NavController,) {
    this._dapDictionary = this.navParams.get('_dapDictionary');
    this.stationList = this.navParams.get('stationList');
    this.trainList = this.navParams.get('trainList');
    this.stationRoute = this.navParams.get('stationRoute');
    // console.log(this.trainList);
    // console.log(this.stationRoute);
    this.parseStations();
  }

  parseStations(): void{
    for(let s of this.stationList){
      if(s[0].match('^\[0-2]')){
        this.List1.push(s);
      }
      else if(s[0].match('^\[3-5]')){
        this.List4.push(s);
      }
      else if(s[0].match('^\[6-9]')){
        this.List7.push(s);
      }
      else if(s[0].match('^\[A-B]')){
        this.List10.push(s);
      }
      else if(s[0].match('^\[C-E]')){
        this.List13.push(s);
      }
      else if(s[0].match('^\[F-K]')){
        this.List16.push(s);
      }
      else if(s[0].match('^\[L-P]')){
        this.List19.push(s);
      }
      else if(s[0].match('^\[Q-T]')){
        this.List22.push(s);
      }
      else if(s[0].match('^\[U-Z]')){
        this.List25.push(s);
      }
    }
    this.List3 = this.DoubleColumn(this.List1, 3);
    this.List2 = this.DoubleColumn(this.List1, 2);
    this.List1 = this.DoubleColumn(this.List1, 1);

    this.List6 = this.DoubleColumn(this.List4, 3);
    this.List5 = this.DoubleColumn(this.List4, 2);
    this.List4 = this.DoubleColumn(this.List4, 1);

    this.List9 = this.DoubleColumn(this.List7, 3);
    this.List8 = this.DoubleColumn(this.List7, 2);
    this.List7 = this.DoubleColumn(this.List7, 1);

    this.List12 = this.DoubleColumn(this.List10, 3);
    this.List11 = this.DoubleColumn(this.List10, 2);
    this.List10 = this.DoubleColumn(this.List10, 1);

    this.List15 = this.DoubleColumn(this.List13, 3);
    this.List14 = this.DoubleColumn(this.List13, 2);
    this.List13 = this.DoubleColumn(this.List13, 1);

    this.List18 = this.DoubleColumn(this.List16, 3);
    this.List17 = this.DoubleColumn(this.List16, 2);
    this.List16 = this.DoubleColumn(this.List16, 1);

    this.List21 = this.DoubleColumn(this.List19, 3);
    this.List20 = this.DoubleColumn(this.List19, 2);
    this.List19 = this.DoubleColumn(this.List19, 1);

    this.List24 = this.DoubleColumn(this.List22, 3);
    this.List23 = this.DoubleColumn(this.List22, 2);
    this.List22 = this.DoubleColumn(this.List22, 1);

    this.List27 = this.DoubleColumn(this.List25, 3);
    this.List26 = this.DoubleColumn(this.List25, 2);
    this.List25 = this.DoubleColumn(this.List25, 1);
  }

  DoubleColumn(a: Array<string>, b: number): Array<string>{
    let result = [];
    let i = a.length / 3 + 1;
    let j = a.length * 2 / 3 + 1;
    switch (b){
      case 1:
        result = a.slice(0, i);
        break;
      case 2:
        result = a.slice(i, j);
        break;
      case 3:
        result = a.slice(j, a.length);
        break;
    }
    return result;
  }

  display(numb: number){
    this.List = numb;
  }

  recordStation(station: string){
    // console.log(this.trainList);    
    this.trainList = this.stationRoute[station];
    this._dapDictionary['station'] = station;
    this.navCtrl.pop().then(() => {
      this.navParams.get('callback')(this.trainList);
    });
  }
}
