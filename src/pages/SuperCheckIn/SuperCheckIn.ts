import { Component } from '@angular/core';
import { NavController, AlertController, ModalController, NavParams} from 'ionic-angular';
import { File } from '@ionic-native/file';
import { DigitModal } from '../DigitModal/DigitModal';

@Component({
  selector: 'page-SuperCheckIn',
  templateUrl: 'SuperCheckIn.html'
})

export class SuperCheckInPage {
  private checkerList = {};
  private SuperList = {};
  public SuperCheck = {};
  public Super = {};
  public signed = false;
  public fileName = null;
  public SuperPayroll = [];
  
  constructor(private navParams: NavParams, public navCtrl: NavController, public file: File, private alertCtrl: AlertController, public modalCtrl: ModalController,) {
    this.checkerList = this.navParams.get('checkerList');
    this.SuperCheck = this.navParams.get('SuperCheck');
    this.SuperCheck['CheckerPayroll'] = this.navParams.get('checkerPayroll');
    this.fileName = this.navParams.get('fileName');
    for(let checker in this.checkerList){
      if(this.checkerList[checker]['isSupervisor'] == 'Y'){
        this.SuperList[checker] = { "lastName": this.checkerList[checker]['lastName'], 
                                    "firstName": this.checkerList[checker]['firstName'],
                                  }
      }
    }
  }

  showChangePayrollAlert(n: number): void{
    let myModal = this.modalCtrl.create(DigitModal, {
      Digit: n, 
    }, {
      showBackdrop: false, 
      enableBackdropDismiss: false
    });
    myModal.onDidDismiss(data => {
      this.updatePayroll(data);
    });
    myModal.present();
  }

  back(){
    this.navCtrl.pop();
  }

  updatePayroll(data : number): void{
    if (data in this.SuperList) {
      this.Super[data] = {'SuperFirstName' : this.SuperList[data]["firstName"],
                          'SuperLastName' : this.SuperList[data]["lastName"],
                          'TimeStamp': this.getTime(),
                        }
      this.SuperCheck['Supervisor'].push(this.Super[data]);
      this.SuperPayroll.push(data);
      // console.log(this.Super);
      // console.log(this.SuperCheck);
      this.save();
    }
    else {
      this.showNoNameFoundAlert();
    }

  }

  showNoNameFoundAlert(): void{
    let alert = this.alertCtrl.create({
      title: 'Please Enter the Correct Payroll #',
      subTitle: "No Name Found for the payroll number just entered."
              + "<br>Please make sure you have the correct payroll number",
      buttons: ['OK']
    });
    alert.present();
  }

  getTime(): string{
    let date = new Date();
    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    let hour = date.getHours().toString();
    let min = date.getMinutes().toString();
    let sec = date.getSeconds().toString();
    let time = this.twoDigit(hour) + ':' + this.twoDigit(min) + ':' + this.twoDigit(sec) + ' ' + this.twoDigit(month) + '/' + this.twoDigit(day) + '/' + year;
    return time;
  }

  twoDigit(t: string): String {
    if (parseInt(t) > 9){
      return t;
    }
    else {
      return '0' + t;
    }
  }

  parseObjectToCSV(): string{
    let Output = '';
    for(let i = 0; i < this.SuperPayroll.length; i ++){
      Output += this.SuperCheck['seqNumb'] + ',' +
                this.SuperCheck['CheckerPayroll'] + ',' +
                this.SuperCheck['AssetTag'] + ',' +
                this.SuperCheck['Supervisor'][i]['TimeStamp'] + ',' +
                this.SuperCheck['Supervisor'][i]['SuperFirstName'] + ',' +
                this.SuperCheck['Supervisor'][i]['SuperLastName'] + ',' +
                this.SuperPayroll[i] + '\n';
    }
    console.log(Output);
    return Output;
  }

  save(){
    this.file.writeExistingFile(this.file.documentsDirectory + 'To_AWS', this.fileName, this.parseObjectToCSV())
            .then(_ => {
              // console.log('file written');
            })
            .catch(err => {
              // console.log('failed to write to file');
            });      
  }

}
