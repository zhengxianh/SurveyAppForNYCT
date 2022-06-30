import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController} from 'ionic-angular';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'page-DigitModal',  
  templateUrl: 'DigitModal.html'
})

export class DigitModal {
  private numOfDigit: number;
  private title: string;
  private number = '';
  private DigitArray = [];

  constructor(public viewCtrl: ViewController, params: NavParams, private navCtrl: NavController, private alertCtrl: AlertController) {
    this.numOfDigit = params.get('Digit');
    if(this.numOfDigit == 4){
      this.title = 'First Car Number';
    }
    else{
      this.title = 'Payroll Number';
    }
  }

  dismiss() {
    for(let i of this.DigitArray){
      this.number = this.number + i.toString();
    }
    this.viewCtrl.dismiss(this.number);
  }

  keypad(key: any): void{
    switch (key){
      case 1:
        if(this.DigitArray.length < this.numOfDigit){
          this.DigitArray.push(1);
        }
        break;
      case 2:
        if(this.DigitArray.length < this.numOfDigit){
          this.DigitArray.push(2);
        }
        break;
      case 3:
        if(this.DigitArray.length < this.numOfDigit){
          this.DigitArray.push(3);
        }
        break;
      case 4:
        if(this.DigitArray.length < this.numOfDigit){
          this.DigitArray.push(4);
        }
        break;
      case 5:
        if(this.DigitArray.length < this.numOfDigit){
          this.DigitArray.push(5);
        }
        break;
      case 6:
        if(this.DigitArray.length < this.numOfDigit){
          this.DigitArray.push(6);
        }
        break;
      case 7:
        if(this.DigitArray.length < this.numOfDigit){
          this.DigitArray.push(7);
        }
        break;
      case 8:
        if(this.DigitArray.length < this.numOfDigit){
          this.DigitArray.push(8);
        }
        break;
      case 9:
        if(this.DigitArray.length < this.numOfDigit){
          this.DigitArray.push(9);
        }
        break;
      case 0:
        if(this.DigitArray.length < this.numOfDigit){
          this.DigitArray.push(0);
        }
        break;
      case 'backspace':
        this.DigitArray.pop();
        break;
      case 'Enter':
        this.dismiss();
    }
  }

}