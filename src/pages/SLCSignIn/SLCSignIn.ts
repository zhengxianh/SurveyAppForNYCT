import { Component, ViewChild} from '@angular/core';
import { NavController, ModalController, AlertController, ToastController, NavParams} from 'ionic-angular';
import { File } from '@ionic-native/file';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { DigitModal } from '../DigitModal/DigitModal';
import { Http } from '@angular/http';
import { S3 } from 'aws-sdk';

import { SLCpage } from '../SLC/SLC';
import { StationSelectionPage } from '../StationSelection/StationSelection';

import { enableProdMode } from '@angular/core';
enableProdMode();

@Component({
  selector: 'page-SLCSignIn',
  templateUrl: 'SLCSignIn.html'
})
export class SLCSignInPage {

  private bucket = new S3({
    accessKeyId: '********************',
    endpoint: 's3.amazonaws.com',
    region: 'us-east-1',
    secretAccessKey: '****************************************',
  })
  public errors = '';

  public _dapDictionary = {};
  public assetTag = '';
  public seqNumb = null;
  private checkerList: object = {};
  private jobList: any[] = [];
  private chosenDate = '';
  private time = '';
  private signed = false;
  private PayrollNum;
  private name = '';
  private signature = '';
  private isDrawing = false;
  public routes = [];
  private validRoutes = false;
  public dir = '';
  private weatherCheck = false;
  private validName = false;
  private validTourStart = false;
  private validTourEnd = false;
  private validWeather = false;
  
  public trainList = [];
  public allTrain = [];
  public direction = ['NB', 'SB'];
  public stationRoute = {};
  public stationList = [];
  public destinationList = {};
  public trainSpec = {};

  callback = data => {
    this.trainList = data;
  };

  constructor(public http: Http, private navCtrl: NavController, private navParams: NavParams, private alertCtrl: AlertController, public modalCtrl: ModalController, private file: File, public toastCtrl: ToastController) {
    // when this page gets called, it will receive the data passed down from the previous page, which is the SLCEntry,
    // then it reads the files and parse them.
    this.assetTag = this.navParams.get('assetTag');
    this.seqNumb = this.navParams.get('seqNumb');
    this.bucket = this.navParams.get('bucket');
    this.parseCheckerFile().then(_ => {
      this.parseStationFile().then(_ => {
        this.parseTrainSpec().then(_ => {
          this.loadObject();
        })
      })
    });
  }

  //------------------------------------------------------------------------------

  parseCheckerFile(): Promise<any>{
    // read and parse the checker file
    return this.file.readAsText(this.file.documentsDirectory + 'From_AWS', 'Checkers.dap')
                    .then(res => {
                      let data = res.split('\n');
                      data = data.filter(element => /\S/.test(element));
                      let ele = data.map(input => input.split(','));
                      ele = ele.map(row => {
                        return row.map(element => 
                            element.trim().replace(/'/g,''))
                      });
                      ele.forEach(checker => {
                        this.checkerList[checker[0]] = {"lastName": checker[2], 
                                                        "firstName": checker[3],
                                                        "isSupervisor": checker[1],
                        };
                      });
    })
    .catch(this.handleError);
  }
  parseTrainSpec(): Promise<any>{
    // read and parse the train spec file
    return this.file.readAsText(this.file.documentsDirectory + 'From_AWS', 'TrainSpec.csv')
                    .then(res => {
                      let data = res.split('\n');
                      data = data.filter(element => /\S/.test(element));
                      let row = data.map(input => input.split(','));
                      row.forEach(train => {
                          this.trainSpec[train[0]] = train.slice(1, train.length);
                      });
                    })
                    .catch(this.handleError);
  }

  parseStationFile(): Promise<any>{
    // read and parse the station file
    return this.file.readAsText(this.file.documentsDirectory + 'From_AWS', 'stations.csv')
                    .then(res => {
                      let data = res.split('\n');
                      data = data.filter(element => /\S/.test(element));
                      let row = data.map(input => input.split(','));
                      row.forEach(train => {
                        this.allTrain.push(train[0]);
                        let temp = train.indexOf('');
                        if(temp != 1){
                          this.destinationList[train[0]] = train.slice(1, temp);
                        }
                        else{
                          this.destinationList[train[0]] = train.slice(1);
                        }
                      });
                    })
                    .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    // console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  //------------------------------------------------------------------------------

  loadObject(): void{
    // create an dictionary obj to hold data
    let date =  new Date(); 
    setInterval(() => {
        date =  new Date();
     }, 1000);

    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    let hour = date.getHours().toString();
    let min = date.getMinutes().toString();
    let sec = date.getSeconds().toString();

    let currentDate = year + this.twoDigit(month) + this.twoDigit(day);
    this.chosenDate = year + '-' +  this.twoDigit(month)  + '-' + this.twoDigit(day);

    let tempTime = hour + min + sec;
    this.time = this.convertTime(date);

    this._dapDictionary = { "assignmentStart": '',
                            "assignmentEnd": '',
                            'AssetTag' : this.assetTag,
                            'seqNumb': this.assetTag + '-' + this.seqNumb.toString(),
                            'actualStartTime': tempTime,
                            "payrollNum": '',
                            "checkerName": null,
                            "weatherCond": undefined,
                            "jobDate": currentDate,
                            "tourStart": '',
                            "tourEnd": '',
                            "route": [],
                            "direction": '',
                            "station": '',
                            "comfortStart": [],
                            "comfortEnd": [],
                            "surveyResult": []
    }
    this.parseStation();
  }

  parseStation(): void{
    // take the data parsed in the station file, and sort them into the formate that where a line will be matched with all its stopping stations.
    // for example: "GS" : ["Grand Central", "42nd st - Time Square"]
    for (let line in this.destinationList){
      for (let station in this.destinationList[line]){
        let s = this.destinationList[line][station];
        if(!(s in this.stationRoute)){
          this.stationRoute[s] = [];
          this.stationRoute[s].push(line);
        }
        else {
          this.stationRoute[s].push(line);
        }
      }
    }
    for (let station in this.stationRoute){
      this.stationList.push(station);
    }
    this.stationList.sort();
    // console.log(this.stationList);
  }

  //------------------------------------------------------------------------------
  // Check out https://github.com/szimek/signature_pad
  // currently the signature is not being saved, the only validation on this component is whether it was signed or not.

  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  private signaturePadOptions: Object = {
    'minWidth': 2,
    'canvasWidth': 600,
    'canvasHeight': 180,
    'backgroundColor': '#707B7C',
    'penColor': '#ECF0F1'
  };

  ionViewDidEnter() {
    this.signaturePad.clear()
  }
 
  drawComplete() {
    this.isDrawing = false;
    this.signed = true;
  }
 
  drawStart() {
    this.isDrawing = true;
  }

  //------------------------------------------------------------------------------

  showNoSignAlert(): void{
  // this alert pops up when user is trying to go to the survey without signing. 
    let alert = this.alertCtrl.create({
      title: 'Please Sign',
      subTitle: 'No Signture Recorded, Please Sign In The Space Provided.',
      buttons: ['OK']
    });
    alert.present();
  }

  showAddNameAlert(): void{
    // this alert pops up when user is trying to enter a payroll # that does not match any records in the checker file
    let alert = this.alertCtrl.create({
      title: 'Please Add Your Name Here',
      inputs: [
        {
          type: 'text',
          name: 'firstName',
          placeholder: 'First Name Here.'
        },
        {
          type: 'text',
          name: 'lastName',
          placeholder: 'Last Name Here.'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: (event: any) => {
          }
        },
        {
          text: 'Save',
          handler: (event: any) => {
            this.validName = true;
            this.name = event.firstName + " " + event.lastName;
            this._dapDictionary['checkerName'] = this.name;
          }
        }
      ]
    });
    alert.present();
  }

  showChangePayrollAlert(n: number): void{
    // this alert is different than other alert because it is a overlay page
    let myModal = this.modalCtrl.create(DigitModal, {
      Digit: n, 
    }, {
      showBackdrop: false, 
      enableBackdropDismiss: false
    });
    myModal.onDidDismiss(data => {
      this.PayrollNum = data;
      this.updatePayroll(this.PayrollNum);
    });
    myModal.present();
  }

  //------------------------------------------------------------------------------

  updatePayroll(event : number): void{
    // function that takes user input payroll and assign it to the dictionary, and using the payroll to get checker names
    this._dapDictionary['payrollNum'] = event;
    if (event in this.checkerList) {
      this.validName = true;
      this.name = this.checkerList[event]['firstName'] + " " + this.checkerList[event]['lastName'];
      this._dapDictionary['checkerName'] = this.name;
    }
    else if(event.toString().length > 4){
      this.showAddNameAlert();
    }
    else {
      this.validName = false;
      this._dapDictionary['checkerName'] = null;
      this.name = "NO NAME FOUND";
    }
  }

  updateWeather(weather : string): void{
    // function that takes user input weather and assign it to the dictionary 
    this.weatherCheck = true;
    this._dapDictionary['weatherCond'] = weather;
    this.validWeather = true;
  }

  updateTourStart(event : string): void{
    // function that takes user input tour start time and assign it to the dictionary
    let tempHour = event['hour'].toString(); 
    let tempMinute = event['minute'].toString(); 
    let t = this.twoDigit(tempHour) + this.twoDigit(tempMinute);
    this._dapDictionary['tourStart'] = t;
    this.validTourStart = true;
  }
  
  updateTourEnd(event : string): void{
    // function that takes user input tour end time and assign it to the dictionary
    let tempHour = event['hour'].toString(); 
    let tempMinute = event['minute'].toString(); 
    let t = this.twoDigit(tempHour) + this.twoDigit(tempMinute);
    this._dapDictionary['tourEnd'] = t;
    this.validTourEnd = true;    
  }

  // updateSurveyTime(t : string): void{
  //   // function that records survey start time and assign it to the dictionary
  //   let tempHour = t.slice(0, 2); 
  //   let tempMinute = t.slice(3, 5); 
  //   let tempSec = t.slice(6, 8); 
  //   t = tempHour + tempMinute + tempSec;
  //   this._dapDictionary['actualStartTime'] = t;
  // }

  // updateSurveyDate(t : string): void{
  //   // function that takes user input date and assign it to the dictionary
  //   let tempMonth = t.slice(0, 4); 
  //   let tempDay = t.slice(5, 7); 
  //   let tempYear = t.slice(8, 10); 
  //   t = tempMonth + tempDay + tempYear;
  //   this._dapDictionary['jobDate'] = t;
  // }

  setRoute(): void{
    // function that takes user input route and assign it to the dictionary, and in the same time check if the selected trains are JMZ,
    // if is, change the direction choice to Inbound/Outbound.s
    this.dir = '';
    this._dapDictionary['direction'] = null;
    if (this.routes[0] == 'J'){
      if(this.routes[1] == 'M'){
        if(this.routes[2] == 'Z'){
          this.direction = ['Inbound', 'Outbound'];
        }
      }
    }
    else {
      this.direction = ['NB', 'SB'];
    }
      this._dapDictionary['route'] = this.routes;
      this.validRoutes = true;
  }

  setDir(event): void{
    // function that takes user input direction and assign it to the dictionary
    this._dapDictionary['direction'] = event;
  }
  
  //------------------------------------------------------------------------------

  goToSurvey(): void{
    // checks if the all the steps are compated, then pulls up the SLC survey page while passing all the essential variables
    if (this.signed == false){
      this.showNoSignAlert();
    }
    else{
      let date = new Date();
      this._dapDictionary['assignmentStart'] = this.convertTime(date);
      this.save();
      this.navCtrl.setRoot(SLCpage, {
        AssignmentDetail: this._dapDictionary,
        Checkers: this.checkerList,
        destinationList: this.destinationList,
        allTrain: this.allTrain,
        trainSpec: this.trainSpec,
        seqNumb: this.seqNumb,
        bucket: this.bucket,
      })
      this.signed = false;
    }
  }

  ChangeStation(): void{
    // pulls up a new page with all stations in the system, and has a callback function which allows the selected station to be pass back
    this.navCtrl.push(StationSelectionPage, {
      callback: this.callback,
      _dapDictionary: this._dapDictionary,
      stationList: this.stationList,
      trainList: this.trainList,
      stationRoute: this.stationRoute,
    })
  }

  //------------------------------------------------------------------------------

  parseObjectToCSV(): string{
    // parse the dictionary to a formated string 
    let Output = this._dapDictionary['seqNumb'] + ',' +
                this._dapDictionary['payrollNum'] + ',' +
                this._dapDictionary['AssetTag'] + ',' +
                this._dapDictionary['jobDate'] + ',' +
                this._dapDictionary['actualStartTime'] + ',' +
                this._dapDictionary['weatherCond'] + ',' +
                this._dapDictionary['tourStart'] + ',' +
                this._dapDictionary['tourEnd'] + ',' +
                this._dapDictionary['station'] + ',' +
                this._dapDictionary['route'] + ',' +
                this._dapDictionary['direction'];
    // console.log(Output);
    return Output;
  }

  save(){
    // save the formated string to local with unique filename
    let fileName = this._dapDictionary['jobDate'] + 'CAFFiPad' + this._dapDictionary['AssetTag'] + 'SLC_' + this._dapDictionary['station'] + '_' + this._dapDictionary['actualStartTime'] + '_H.csv';
    this.file.createFile(this.file.documentsDirectory + 'To_AWS', fileName, true)
            .then(_ => {
              // console.log('file created');
              return this.file.writeExistingFile(this.file.documentsDirectory + 'To_AWS', fileName, this.parseObjectToCSV())
                              .then(_ => {
                                // console.log('file written')
                                return Promise.resolve();
                              })
                              .catch(err => {
                                // console.log('failed to write to file')
                                return Promise.reject('****Error****: Fail to write' + err)
                              });

            })
            .catch(err => {
              // console.log('failed to create file')
            });
  }

  //------------------------------------------------------------------------------

  twoDigit(t: string): string {
    // simple function for adding a place holding 0 if the date is less than 2 digits, for ex: 2/1/2018 will be 02/01/2018.
    if (parseInt(t) > 9){
      return t;
    }
    else {
      return '0' + t;
    }
  }

  convertTime(date: Date): string{
    // simple function for converting time in to correct format, for ex: 10:9:5 will be 10:09:05.
    let hour = date.getHours().toString();
    let min = date.getMinutes().toString();
    let sec = date.getSeconds().toString();
    let time = this.twoDigit(hour) + ':' + this.twoDigit(min) + ':' + this.twoDigit(sec);
    return time;
  }

}
