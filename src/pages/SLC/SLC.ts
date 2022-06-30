import { Component } from '@angular/core';
import { NavController, AlertController, ModalController, NavParams} from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { ModalPage } from '../modal-page/modal-page';
import { DigitModal } from '../DigitModal/DigitModal';
import { SuperCheckInPage } from '../SuperCheckIn/SuperCheckIn';
import { enableProdMode } from '@angular/core';
import { S3 } from 'aws-sdk';

enableProdMode();

@Component({
  selector: 'page-SLC',
  templateUrl: 'SLC.html'
})
export class SLCpage {

  private bucket = new S3({
    accessKeyId: '******************',
    endpoint: 's3.amazonaws.com',
    region: 'us-east-1',
    secretAccessKey: '***********************************************',
  })
  public errors = '';
  
  public _dapDictionary = {};
  public surveyResult = [];
  public _currentJobStop = {};
  public _currentJobStopCars = {};
  public destinationList = {};
  public isComplete = false;
  public isEmpty = false;
  public trainSpec = {};
  public checkerList = {};
  public trainList = [];
  public onComfort = false;
  public surveyCount = 0;
  public CurrentSuvey = 0;
  public trainCap = 0;
  public trainCarMax = 0;
  public trainCarMin = 0;
  public line = null;
  public other = null;
  public currentCar = 1;
  public currentLine = null;
  public checkOther = false;
  public carNumb = null;
  public destination = null;
  public fileName = null;
  public comfortFileName = null;
  public seqNumb = null;
  public comment = '';
  public TrainStop = 1; // 1 - new train, stop buttons enabled and start button disabled | 2 - train stopped, stop button disabled and start button enabled | 3 - train started, both button disabled
  public TrainArriveColor = '#FFFF00';
  public TrainLeaveColor = '#488aff';
  public SuperCheck = { 'AssetTag' : '',
                        'seqNumb' : '',
                        'CheckerPayroll' : '',
                        'Supervisor' : [],
  }; 
  public CarColor = { '1' : '#8A2BE2',
                      '2' : '#E6E6FA',
                      '3' : '#E6E6FA',
                      '4' : '#E6E6FA',
                      '5' : '#E6E6FA',
                      '6' : '#E6E6FA',
                      '7' : '#E6E6FA',
                      '8' : '#E6E6FA',
                      '9' : '#E6E6FA',
                      '10' : '#E6E6FA',
                      '11' : '#E6E6FA',
  };

  public CountColor = { '1' : ['#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#FFA500'],
                        '2' : ['#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#FFA500'],
                        '3' : ['#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#FFA500'],
                        '4' : ['#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#FFA500'],
                        '5' : ['#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#FFA500'],
                        '6' : ['#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#FFA500'],
                        '7' : ['#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#FFA500'],
                        '8' : ['#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#FFA500'],
                        '9' : ['#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#FFA500'],
                        '10' : ['#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#FFA500'],
                        '11' : ['#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#488aff', '#FFA500'],
  };

  callback = data => {
    // receives data passed back from the surpervisor check in page.
    this.SuperCheck = data;
  }
  
  constructor(public platform: Platform, private navParams: NavParams, public navCtrl: NavController, public file: File, private alertCtrl: AlertController, public modalCtrl: ModalController) {
    this.bucket = this.navParams.get('bucket');
    this._dapDictionary = this.navParams.get('AssignmentDetail');
    this.seqNumb = this.navParams.get('seqNumb');
    this.fileName = this._dapDictionary['jobDate'] + 'CAFFiPad' + this._dapDictionary['AssetTag'] + 'SLC_' + this._dapDictionary['station'] + '_' + this._dapDictionary['actualStartTime'] + '.csv';
    this.comfortFileName = this._dapDictionary['jobDate'] + 'CAFFiPad' + this._dapDictionary['AssetTag'] + 'SLC_' + this._dapDictionary['station'] + '_' + this._dapDictionary['actualStartTime'] + '_Comf.csv';
    this.checkerList = this.navParams.get('Checkers');
    this.SuperCheck['AssetTag'] = this._dapDictionary['AssetTag'];
    this.SuperCheck['seqNumb'] = this._dapDictionary['seqNumb'];
    this.destinationList = this.navParams.get('destinationList');
    this.destinationList['WT'] = ['N/A'];
    this.destinationList['NIS'] = ['N/A'];
    this.trainList = this.navParams.get('allTrain');
    this.trainList.push('WT');
    this.trainList.push('NIS');
    this.trainList.sort();
    this.trainSpec = this.navParams.get('trainSpec');
    this.surveyResult = this._dapDictionary["surveyResult"];
    this.loadTrip();
  }

  loadTrip() {
    //this function will attach a surveyResult object to the existing _dapDictionary object to collect data for the upcoming train.
    this._dapDictionary["surveyResult"].push({"trainID": null,
                                              "leadCarNumb": null,
                                              "destination": null,
                                              "notes": '',
                                              "actualArrive": null,
                                              "actualLeave": null,
                                              "cars": { '1': null,
                                                        '2': null,
                                                        '3': null,
                                                        '4': null,
                                                        '5': null,
                                                        '6': null,
                                                        '7': null,
                                                        '8': null,
                                                        '9': null,
                                                        '10': null,
                                                        '11': null,
                                            },
                            })
    this._currentJobStop = this._dapDictionary['surveyResult'][this.CurrentSuvey];
    this._currentJobStopCars = this._currentJobStop['cars'];
  }

  //------------------------------------------------------------------------------

  setCar(n: number): void{
    // move the current car to the next car and change the colors of the buttons at the same time.
    this.currentCar = n;
    for(let i = 1; i <= 11; i++){
      if(i == n){
        this.CarColor[n] = '#8A2BE2';
      }
      else{
        this.CarColor[i] = '#E6E6FA';
      }
    }
  }

  setLoad(load: number, car: number){
    // move the current car to the next car and change the colors of the buttons at the same time.
    if(this._currentJobStopCars[car] != load){
      this._currentJobStopCars[car] = load;
      for (let i = 0; i <= 24; i++){
        if(i == load){
          this.CountColor[car][load] = '#32db64'; //desired Color
        }
        else{
          this.CountColor[car][i] = '#488aff';
          if (i == 24){
            this.CountColor[car][i] = '#FFA500';
          }
        }
      }
    }
    else{
      if(this.currentCar < this.trainCarMax){
        this.setCar(this.currentCar + 1);
      }
      if(this.currentCar == 3 && this.TrainStop == 2 && this._currentJobStop['actualLeave'] == null){
        this.setTrainTime(0);
      }
    }
  }

  setTrain(event: any){
    // select a train line will trigger this function which sets all the attributes for this train,
    // includes train cars and car capacity, and will erase the filled data if the line changes.
    if(this._currentJobStop['trainID'] != null){
      if(event != this._currentJobStop['trainID']){
        this.resetEverything();
      }
    }
    if (!(event === undefined || event.length == 0)){
      if (event != 'OTHER'){
        this.line = event;
        this._currentJobStop['trainID'] = this.line;
        this.trainCap = parseInt(this.trainSpec[this.line][0]);
        this.trainCarMin = parseInt(this.trainSpec[this.line][1]);
        this.trainCarMax = parseInt(this.trainSpec[this.line][2]);
        this.currentLine = this.line;
        for(let i = 0; i < this._dapDictionary['route'].length; i++){
          if(this.line == this._dapDictionary['route'][i]){
            this.checkOther = false;
            break;
          }
          else{
            this.checkOther = true;
          }
        }
        this.other = null;
        this.setDest();
      }
      else {
        this.showOtherTrainAlert();
      }
    }
  }

  setDest(){
    // this funciton fills the destinatiion based on the selected line and the direction that was choosen, 
    // note that the MJZ trains have a different direction and destination
    if(this.currentLine != null){
      switch (this._dapDictionary['direction']){
        case 'NB':
          if (this.currentLine == 'M'){
            this.destination = this.destinationList[this.currentLine][this.destinationList[this.currentLine].length - 1];
            this._currentJobStop['destination'] = this.destinationList[this.currentLine][this.destinationList[this.currentLine].length - 1];  
          }
          else {
            this.destination = this.destinationList[this.currentLine][0];
            this._currentJobStop['destination'] = this.destinationList[this.currentLine][0];
          }
          break;
        case 'SB':
          if (this.currentLine == 'M'){
            this.destination = this.destinationList[this.currentLine][0];
            this._currentJobStop['destination'] = this.destinationList[this.currentLine][0];
          }
          else {
            this.destination = this.destinationList[this.currentLine][this.destinationList[this.currentLine].length - 1];
            this._currentJobStop['destination'] = this.destinationList[this.currentLine][this.destinationList[this.currentLine].length - 1];
          }
          break;
        case 'Outbound':
          if (this.currentLine == 'M' || this.currentLine == 'J' || this.currentLine == 'Z'){
            this.destination = this.destinationList[this.currentLine][0];
            this._currentJobStop['destination'] = this.destinationList[this.currentLine][0];
          }
          else {
            this.destination = this.destinationList[this.currentLine][this.destinationList[this.currentLine].length - 1];
            this._currentJobStop['destination'] = this.destinationList[this.currentLine][this.destinationList[this.currentLine].length - 1];
          }
          break;
        case 'Inbound':
          if (this.currentLine == 'M' || this.currentLine == 'J' || this.currentLine == 'Z'){
            this.destination = this.destinationList[this.currentLine][this.destinationList[this.currentLine].length - 1];
            this._currentJobStop['destination'] = this.destinationList[this.currentLine][this.destinationList[this.currentLine].length - 1];
          }
          else {
            this.destination = this.destinationList[this.currentLine][0];
            this._currentJobStop['destination'] = this.destinationList[this.currentLine][0];
          }
          break;
      }
    }
    else{
      this._currentJobStop['destination'] == null;
    }
  }

  setTrainTime(bool: any){
    // keeps track of the arrive/leave state of the train, see TrainStop for explaination 
    if(bool == 1){
      this.setArriveTime();
      this.TrainArriveColor = '#488aff';
      this.TrainLeaveColor = '#FFD700';
    }
    else{
      this.setLeaveTime();
      this.TrainLeaveColor = '#488aff';
    }
  }

  setArriveTime() {
    // set train arrive time
    let date = new Date();
    this._currentJobStop['actualArrive'] = this.convertTime(date);
    this.TrainStop = 2;
  }

  setLeaveTime() {
    // set train leave time
    let date = new Date();
    this._currentJobStop['actualLeave'] = this.convertTime(date);
    this.TrainStop = 2;
  }

  setTimeStamp(){
    // set WT/NIS train arraive and leave time
    let date = new Date();
    this._currentJobStop['actualArrive'] = this.convertTime(date);
    this._currentJobStop['actualLeave'] = this.convertTime(date);
  }

  setCarNumb(carNumb: string){
    // set the car number for the current train
    if(carNumb.length == 4 ){
      this._currentJobStop['leadCarNumb'] = carNumb;
      this.carNumb = carNumb;
    }
  }

  setComment(comment: String){
    // set comments for the current train if any
    this._currentJobStop['notes'] = comment;
  }

  //------------------------------------------------------------------------------

  previousTrain(){
    // when the previous button are pressed, this function will first check if the survey was completed, 
    // if true, reset all buttons, move the survey counter back, repopulate the buttons with recorded 
    // survey details, 
    if(this.checkSurveyComplete()){
      this.isEmpty = false;
      this.resetPanel();
      this.CurrentSuvey--;
      this._currentJobStop = this._dapDictionary['surveyResult'][this.CurrentSuvey];
      this._currentJobStopCars = this._currentJobStop['cars'];  
      this.line = this._currentJobStop['trainID'];
      this.carNumb = this._currentJobStop['leadCarNumb'];
      this.comment = this._currentJobStop['notes'];
      this.destination = this._currentJobStop['destination']; 
      this.TrainStop = 3;
      this.TrainArriveColor = '#488aff';
      this.TrainLeaveColor = '#488aff';
      for (let i = 1; i <= 11; i++){
        for (let j = 0; j < this.CountColor[i].length; j++){
          if (j == this._currentJobStopCars[i]){
            this.CountColor[i][j] = '#32db64';
          }
          else{
            if (j == 24){
              this.CountColor[i][j] = '#FFA500';
            }
            else{
              this.CountColor[i][j] = '#488aff';
            }
          }
        }
      }
    }
  }

  nextTrain(){
    // when the next button was pressed this function will first check if the survey was completed, and is not empty,
    // if true, if will again check if the next survey was a new survey or a filled survey. If filled survey, populate
    // buttons with recorded data. If new survey, a new object will be append into the data array.
    if(this.checkSurveyComplete() && !this.isEmpty){
      if(this.CurrentSuvey < this.surveyCount){
        this.CurrentSuvey++;
        this._currentJobStop = this._dapDictionary['surveyResult'][this.CurrentSuvey];
        this._currentJobStopCars = this._currentJobStop['cars'];  
        this.line = this._currentJobStop['trainID'];
        this.carNumb = this._currentJobStop['leadCarNumb'];
        this.comment = this._currentJobStop['notes'];
        if(this.line != null){
          this.setDest();
        }
        else{
          this.destination = null;
          this._currentJobStop['destination'] = null;
        }
        if(this._currentJobStop['actualArrive'] == null || this._currentJobStop['actualLeave'] == null){
          this.TrainStop = 1;
        }
        else if(this._currentJobStop['actualArrive'] != null || this._currentJobStop['actualLeave'] == null){
          this.TrainStop = 2;
        }
        else {
          this.TrainStop = 3;
        }
        this.isComplete = false;
        this.TrainArriveColor = '#488aff';
        this.TrainLeaveColor = '#488aff';
        this.resetPanel();
        for (let i = 1; i <= 11; i++){
          if (this._currentJobStopCars[i] != null){
            this.CountColor[i][this._currentJobStopCars[i]] = '#32db64';
          }
        }
      }
      else {
        this.addTrain();
      }
    }
  }
  
  addTrain(){
    // adding a new train object to the array, and resetting all the state variable to default
    this.save();
    let newSurvey = { "trainID": null,
                      "leadCarNumb": null,
                      "destination": null,
                      "notes": '',
                      "actualArrive": null,
                      "actualLeave": null,
                      "cars": { '1': null,
                                '2': null,
                                '3': null,
                                '4': null,
                                '5': null,
                                '6': null,
                                '7': null,
                                '8': null,
                                '9': null,
                                '10': null,
                                '11': null,
                              },
                  };
    this._dapDictionary['surveyResult'].push(newSurvey);
    this.surveyCount++;
    this.CurrentSuvey++;
    this._currentJobStop = this._dapDictionary['surveyResult'][this.CurrentSuvey];
    this._currentJobStopCars = this._currentJobStop['cars'];    
    this.line = null;
    this.carNumb = null;
    this.comment = null;
    this.checkOther = false;
    this.other = null;
    this.currentLine = null;
    this.destination = null;
    this.TrainStop = 1;
    this.isComplete = false;
    this.TrainArriveColor = '#FFFF00';
    this.resetPanel();
  }

  //------------------------------------------------------------------------------

  resetPanel(){
    // reset the number pad to default colors
    for (let i = 1; i <= 11; i++){
      for (let j = 0; j < 24; j++){
        if (j == 24){
          this.CountColor[i][j] = '#FFA500';
        }
        else{
          this.CountColor[i][j] = '#488aff';
        }
      }
    }
    this.setCar(1);
  }

  resetEverything(){
    // reset the number pad color as well as
    // for (let i = 1; i <= this.trainSpec[this._currentJobStop['trainID']][1]; i++){
    for (let i = 1; i <= 11; i++){
      for (let j = 0; j <= 24; j++){
        if (j == 24){
          this.CountColor[i][j] = '#FFA500';
        }
        else{
          this.CountColor[i][j] = '#488aff';
        } 
      }
      this._currentJobStopCars[i] = null;
    }
    this.setCar(1);
  }

  resetCar(){
    let curCar = this.trainCarMin + 1;
    for(curCar; curCar <= 11; curCar++){
      for (let j = 0; j <= 23; j++){
        this.CountColor[curCar][j] = '#488aff';        
      }
      this.CountColor[curCar][24] = '#32db64';        
      this._currentJobStopCars[curCar] = null;
    }
  }

  //------------------------------------------------------------------------------

  checkForCarData(){
    // check if any car is missing passenger count, if true, return the car index where the data is missing
    // if the number of counts are not equal to the difference of the max-min car, it will pop a alert.
    let count = 0;
    for(let i = 1; i <= this.trainCarMin; i++){
      if(this._currentJobStopCars[i] == null && i <= this.trainCarMin){
        return i
      }
    }
    for(let car = this.trainCarMin + 1; car <= this.trainCarMax; car++){
      if(this._currentJobStopCars[car] == null){
        count++
      }
    }
    if(count != (this.trainCarMax - this.trainCarMin) && count != 0){
      return 'e'
    }
    else {
      return null;
    }
  }

  checkSurveyComplete(): boolean{
    // check if the survey is complete, which means all the necessary fields were filled out. if not, pop alert with error
    if(this._currentJobStop['trainID'] == null && this._currentJobStop['leadCarNumb'] == null && this._currentJobStop['actualArrive'] == null){
      // console.log("empty survey")
      this.isComplete = true;
      this.isEmpty = true;
    }
    else if(this._currentJobStop['trainID'] == null || this._currentJobStop['leadCarNumb'] == null || this._currentJobStop['actualArrive'] == null || this._currentJobStop['actualLeave'] == null){
      // console.log("incomplete survey")
      this.isComplete = false;
      this.isEmpty = false;
      this.showIncompleteAlert();
    }
    else{
      let incompleteData = this.checkForCarData();
      if(incompleteData != null){
        this.isComplete = false;
        this.isEmpty = false;
        if(incompleteData == 'e'){
          this.showDataErrorAlert();
        }
        else{
          this.showNoCarDataAlert(incompleteData);
        }
      }
      else {
        this.isComplete = true;
        this.isEmpty = false;
      }
    }
    return this.isComplete;
  }

  //------------------------------------------------------------------------------

    superCheckIn(): void{
      // displays the supervisor page
      this.navCtrl.push(SuperCheckInPage, {
        callback: this.callback,
        checkerPayroll: this._dapDictionary['payrollNum'],
        fileName: this._dapDictionary['jobDate'] + 'CAFFiPad' + this._dapDictionary['AssetTag'] + 'SLC_' + this._dapDictionary['station'] + '_' + this._dapDictionary['actualStartTime'] + '_Sup.csv',
        SuperCheck: this.SuperCheck,
        checkerList: this.checkerList,
      })
    }
  
    viewHistory(){
      // displays the history page
      this.save();
      let myModal = this.modalCtrl.create(ModalPage, {
        recordedData: this._dapDictionary, 
        dataFile: this.fileName,
        seqNumb: this.seqNumb,
        bucket: this.bucket,
      }, {
          cssClass: 'update-history-modal',
          showBackdrop: false, 
          enableBackdropDismiss: false
        });
      myModal.present();
    }

  //------------------------------------------------------------------------------

  startComfort() {
    // display the comfort alert with time attached, this alert box also prevent other click other,
    // unless the user press on the End Comfort button.
    let startTime = new Date();
    this._dapDictionary['comfortStart'].push(this.convertTime(startTime));
    let alert = this.alertCtrl.create({
      title: 'Comfort Break',
      subTitle: 'You\'ve started a comfort break at ' + this.convertTime(startTime),
      buttons: [{
          text: 'End Comfort',
          handler: () => {
            let endTime = new Date();
            this._dapDictionary['comfortEnd'].push(this.convertTime(endTime));  
            this.saveComfort();
          }
        }],
      enableBackdropDismiss: false,
    });
    alert.present();
}

  showOtherTrainAlert(): void{
    // display the alert that holds all train, give user the choice to select the train that does not
    // go to this station.
    let alert = this.alertCtrl.create({
      enableBackdropDismiss: false,
    });
    alert.setTitle('Please select the train from the following list:');
    for (let line in this.trainList){
      alert.addInput({
        type: 'checkbox',
        label: this.trainList[line],
        value: line,
        handler: data => {
          this.checkOther = true;
          this.other = data.label;
          this.currentLine = this.other;
          this._currentJobStop['trainID'] = this.other;
          this.trainCap = this.trainSpec[this.other][0];
          this.trainCarMin = parseInt(this.trainSpec[this.other][1]);
          this.trainCarMax = parseInt(this.trainSpec[this.other][2]);
          this.setDest();
          alert.dismiss();
        }
      }); 
    }
    alert.present();
  }

  showSetCarNumbAlert(n: number): void{
    // display the key pad for entering car numbers
    let myModal = this.modalCtrl.create(DigitModal, {
      Digit: n, 
    }, {
        showBackdrop: false, 
        enableBackdropDismiss: false
      });
    myModal.onDidDismiss(data => {
      this.setCarNumb(data)
    });
    myModal.present();
  }

  showNoLeaveTimeAlert(){
    // not in use
    let alert = this.alertCtrl.create({
      title: 'Survey Incomplete',
      subTitle: 'No train leave time recorded. Please hit Wheel Start button to proceed.',
      buttons: ['OK']
    });
    alert.present();
  }

  showIncompleteAlert(): void{
    // show alert if survey incomplete
    let alert = this.alertCtrl.create({
      title: 'Survey Incomplete',
      subTitle: 'Please finish this survey before go on to anyother page.',
      buttons: ['OK']
    });
    alert.present();
  }

  showNoCarDataAlert(car: any): void{
    // show alert if missing passenger count data for car
    let alert = this.alertCtrl.create({
      title: 'Survey Incomplete',
      subTitle: 'No count recorded for car# ' + car + '. Please fill out each field to proceed.',
      buttons: ['OK']
    });
    alert.present();
  }

  showDataErrorAlert(): void{
    // show alert if the last few cars are not filled out correctly
    let alert = this.alertCtrl.create({
      title: 'Survey Incomplete',
      subTitle: 'Complete passenger count for'
              + '<br>all cars <b>OR</b> press <b>No Car</b>'
              + '<br>button to delete counts.',
      buttons: ['OK']
    });
    alert.present();
  }

  //------------------------------------------------------------------------------

  save(){
    // save locally as well as push a copy to aws, if it fails to save locally, it will try to push to aws directly instead.
    this.file.writeExistingFile(this.file.documentsDirectory + 'To_AWS', this.fileName, this.parseObjectToCSV())
            .then(_ => {
              return this.bucket.putObject({Bucket: 'ops-planning', Key: 'From_iPad/SubwayLoadCheck/' + this.fileName, Body: this.parseObjectToCSV()}, function(err, data){})
                          .promise()
                          .then(res => {
                            console.log('upload successful');
                          })
                          .catch(rej => {
                            console.log('upload failed');
                          });
                        })
            .catch(err => {
              return this.bucket.putObject({Bucket: 'ops-planning', Key: 'From_iPad/SubwayLoadCheck/' + this.fileName, Body: this.parseObjectToCSV()}, function(err, data){})
                          .promise()
                          .then(res => {
                            console.log('upload successful');
                          })
                          .catch(rej => {
                            console.log('upload failed');
                          });
            });     
  }

  saveComfort(){
    // save the comfort time locally and push a copy to aws, will push to aws directly if failed to save locally
    this.file.writeExistingFile(this.file.documentsDirectory + 'To_AWS', this.comfortFileName, this.parseComfortObjectToCSV())
            .then(_ => {
              return this.bucket.putObject({Bucket: 'ops-planning', Key: 'From_iPad/SubwayLoadCheck/' + this.fileName, Body: this.parseComfortObjectToCSV()}, function(err, data){})
                          .promise()
                          .then(res => {
                            // console.log('upload successful');
                          })
                          .catch(rej => {
                            // console.log('upload failed');
                          });
                        })
            .catch(err => {
              return this.bucket.putObject({Bucket: 'ops-planning', Key: 'From_iPad/SubwayLoadCheck/' + this.comfortFileName, Body: this.parseComfortObjectToCSV()}, function(err, data){})
                          .promise()
                          .then(res => {
                            // console.log('upload successful');
                          })
                          .catch(rej => {
                            // console.log('upload failed');
                          });
            });     
  }

  //------------------------------------------------------------------------------

  parseObjectToCSV(): string{
    let Output = '';
    for(let i = 0; i < this.surveyResult.length; i ++){
      if(this.surveyResult[i]['cars']['1'] != null){
        Output += this._dapDictionary['seqNumb'] + ',' +
                  this._dapDictionary['payrollNum'] + ',' +
                  this._dapDictionary['AssetTag'] + ',' +
                  this._dapDictionary['station'] + ',' +
                  this._dapDictionary['direction'] + ',' +
                  this.surveyResult[i]['trainID'] + ',' +
                  this.surveyResult[i]['leadCarNumb'] + ',' +
                  this.surveyResult[i]['destination'] + ',' +
                  this.surveyResult[i]['actualArrive'] + ',' +
                  this.surveyResult[i]['actualLeave'] + ',' +
                  this.surveyResult[i]['cars']['1'] + ',' +
                  this.surveyResult[i]['cars']['2'] + ',' +
                  this.surveyResult[i]['cars']['3'] + ',' +
                  this.surveyResult[i]['cars']['4'] + ',' +
                  this.surveyResult[i]['cars']['5'] + ',' +
                  this.surveyResult[i]['cars']['6'] + ',' +
                  this.surveyResult[i]['cars']['7'] + ',' +
                  this.surveyResult[i]['cars']['8'] + ',' +
                  this.surveyResult[i]['cars']['9'] + ',' +
                  this.surveyResult[i]['cars']['10'] + ',' +
                  this.surveyResult[i]['cars']['11'] + ',' +
                  this.surveyResult[i]['notes'] + '\n';
      }
    }
    return Output;
  }

  parseComfortObjectToCSV(): string{
    let Output = '';
    let comfortBreakStart = this._dapDictionary['comfortStart']
    let comfortBreakEnd = this._dapDictionary['comfortEnd']
    for(let i = 0; i < comfortBreakStart.length; i ++){
      Output += this._dapDictionary['seqNumb'] + ',' +
                this._dapDictionary['payrollNum'] + ',' +
                this._dapDictionary['AssetTag'] + ',' +
                this._dapDictionary['station'] + ',' +
                this._dapDictionary['direction'] + ',' +
                comfortBreakStart[i] + ',' +
                comfortBreakEnd[i] + '\n';
    }
    return Output;
  }

  twoDigit(t: string): String {
    if (parseInt(t) > 9){
      return t;
    }
    else {
      return '0' + t;
    }
  }

  convertTime(date: Date): String{
    let hour = date.getHours().toString();
    let min = date.getMinutes().toString();
    let sec = date.getSeconds().toString();
    let time = this.twoDigit(hour) + ':' + this.twoDigit(min) + ':' + this.twoDigit(sec);
    return time;
  }
  

}


