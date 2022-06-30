import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { SLCEntryPage } from '../SLCEntry/SLCEntry';
import { enableProdMode } from '@angular/core';
import { S3 } from 'aws-sdk';

enableProdMode();

@Component({
  selector: 'page-modal',  
  templateUrl: 'modal-page.html'
})
export class ModalPage {
  
  private bucket = new S3({
    accessKeyId: '******************',
    endpoint: 's3.amazonaws.com',
    region: 'us-east-1',
    secretAccessKey: '***************************************',
  })
  public errors = '';
  
  public LocalData = [];
  public _dapDictionary = {};
  public data: string;
  public comfortStart: string;
  public comfortEnd: string;
  public fileName = null;
  public seqNumb = null;
  public surveyResult = [];

  constructor(public viewCtrl: ViewController, params: NavParams, private navCtrl: NavController, private alertCtrl: AlertController, public file: File,) {
    this.bucket = params.get('bucket');
    this._dapDictionary = params.get('recordedData');
    this.seqNumb = params.get('seqNumb');
    this.fileName = params.get('dataFile');
    this.data = this._dapDictionary['surveyResult'];
    this.comfortStart = this._dapDictionary['comfortStart'];
    this.comfortEnd = this._dapDictionary['comfortEnd'];
    this.surveyResult = this._dapDictionary["surveyResult"];
    // console.log(this._dapDictionary);
    // console.log(this.data);
    // console.log(this.comfortStart);
    // console.log(this.comfortEnd);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  EndSurvey(){
    
    this.showConfirmEndAlert();
  }

  showConfirmEndAlert(): void{
    let alert = this.alertCtrl.create({
      title: 'ARE YOU SURE?',
      subTitle: "Double Check your data," 
              + "<br>Click <b>Close</b> to go back,"
              + "<br>Click <b>Submit</b> to <b>END SURVEY</b>.",
      buttons: [{
          text: 'Close',
        },
        {
          text: 'Submit',
          handler: () => {
            let date = new Date();
            this._dapDictionary['assignmentEnd'] = this.convertTime(date);
            this.file.writeExistingFile(this.file.documentsDirectory + 'To_AWS', this.fileName, this.parseObjectToCSV())
                    .then(_ => {
                      // console.log('file written')
                      return this.CheckingForAvaliableData();
                    })
                    .catch(err => {
                      // console.log('failed to write to file')
                      this.showUnableToSaveAlert(err);
                    });        
            this.dismiss();
            this.navCtrl.setRoot(SLCEntryPage);
          }
        }
      ]
    });
    alert.present();
  }

  showUnableToSaveAlert(err: string): void{
    let alert = this.alertCtrl.create({
      title: 'Write To File Failed',
      subTitle: "Error occured during writing to file."
              + "<br><b>Error:</b> " + err
              + "<br>Click <b>Continue</b> to <b>UPLOAD W/O SAVING</b>."
              + "<br>Please <b>Notify Supervisor</b> if this error keeps on showing up.",
      buttons: [{
          text: 'Continue',
          handler: () => {
            this.bucket.putObject({Bucket: 'ops-planning', Key: 'From_iPad/SubwayLoadCheck/' + this.fileName, Body: this.parseObjectToCSV()}, function(err, data){})
                  .promise()
                  .then(res => {
                    // console.log('upload successful');
                    this.dismiss();
                    this.navCtrl.setRoot(SLCEntryPage);
                  })
                  .catch(rej => {
                    // console.log('upload failed');
                    this.showUploadErrorAlert(rej);
                    return Promise.reject(rej);
                  });
          }
        }
      ]
    });
    alert.present();
  }

  showUploadErrorAlert(err: string): void{
    let alert = this.alertCtrl.create({
      title: 'Data Upload Failed',
      subTitle: "Error occured during upload."
              + "<br><b>Error:</b> " + err
              + "<br>Click <b>Ignor</b> to <b>END SURVEY</b>."
              + "<br>Click <b>Retry</b> to <b>UPLOAD AGAIN</b>.",
      buttons: [{
          text: 'Ignor',
          handler: () => {
            this.dismiss();
            this.navCtrl.setRoot(SLCEntryPage);
          }
        },
        {
          text: 'Retry',
          handler: () => {
            new Promise((res, rej) => {
              this.CheckingForAvaliableData()
                  .then(res => {

                  })
                  .then(res => {
                    // console.log('Files uploaded')
                    this.dismiss();
                    this.navCtrl.setRoot(SLCEntryPage);
                    return Promise.resolve
                  })
                  .catch(rej => {
                    // console.log('Files uploaded');
                    this.showUploadErrorAlert(rej);
                  })
            })
          }
        }
      ]
    });
    alert.present();
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
    // console.log(Output);
    return Output;
  }

  //------------------------------------------------------------------------------
  
  convertTime(date: Date): String{
    let month = date.getMonth().toString();
    let day = date.getDay().toString();
    let year = date.getFullYear.toString();
    let hour = date.getHours().toString();
    let min = date.getMinutes().toString();
    let sec = date.getSeconds().toString();
    let time = this.twoDigit(hour) + ':' + this.twoDigit(min) + ':' + this.twoDigit(sec);
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

  //------------------------------------------------------------------------------

  CheckingForAvaliableData(): Promise<any>{
    return this.file.listDir(this.file.documentsDirectory, 'To_AWS')
                    .then(res => {
                      res.forEach(element => {
                        this.LocalData.push(element['name']);
                      })
                      if (this.LocalData.length >= 0){
                        return this.UploadAllData(0, this.LocalData.length, this.LocalData);
                      }
                      else{
                        return Promise.resolve();
                      }
                    })
                    .catch(rej => {
                      console.log(rej);
                      return Promise.reject(rej);
                    })
  }

  UploadAllData(current: number, target: number, content: Array<string>): Promise<any>{
    if(current == target){
      // console.log('upload files completed')
      return Promise.resolve();
    }
    return this.UploadEachData(content[current])
                .then(res => {
                  // console.log(content[current] + ' uploaded.');
                  return this.UploadAllData(current+1, target, content);
                })
                .catch(err => {
                  // console.log(content[current] + ' fail to upload.');
                  return this.UploadAllData(current+1, target, content);
                })
  }

  UploadEachData(thisFile: string){
    return this.file.readAsText(this.file.documentsDirectory + 'To_AWS', thisFile)
                    .then(res => {
                      console.log(res);
                      return this.bucket.putObject({Bucket: 'ops-planning', Key: 'From_iPad/SubwayLoadCheck/' + thisFile, Body: res}, function(err, data){})
                                    .promise()
                                    .then(res => {
                                      // console.log('upload successful');
                                      return this.file.moveFile(this.file.documentsDirectory + 'To_AWS', thisFile, this.file.documentsDirectory + 'BackUp', thisFile)
                                                      .then(res => {
                                                        // console.log(thisFile + ' moved to backup');
                                                        return Promise.resolve();
                                                      })
                                                      .catch(rej => {
                                                        return Promise.reject(rej);
                                                      });
                                    })
                                    .catch(rej => {
                                      // console.log('upload failed');
                                      // this.showUploadErrorAlert(rej);
                                      return Promise.reject(rej);
                                    });
                    })
                    .catch(rej => {
                      console.log('can not read file');
                      console.log(rej);
                      // this.showUploadErrorAlert(rej);
                      return Promise.reject(rej);
                    });
  }
}