import { Component } from '@angular/core';
import { File } from '@ionic-native/file';
import { NavController, AlertController, LoadingController} from 'ionic-angular';
import { Http } from '@angular/http';
import { Device } from '@ionic-native/device';
import { Platform } from 'ionic-angular';
import { S3 } from 'aws-sdk';

import { SLCSignInPage } from '../SLCSignIn/SLCSignIn';

import { enableProdMode } from '@angular/core';
enableProdMode();

@Component({
  selector: 'page-SLCEntry',
  templateUrl: 'SLCEntry.html'
})

export class SLCEntryPage {

  private bucket = new S3({
    accessKeyId: '****************',
    endpoint: 's3.amazonaws.com',
    region: 'us-east-1',
    secretAccessKey: '****************************************',    
  })

  public errors = '';
  public deviceName = '';
  public assetTag = '';
  public fileListOnCloud = [];
  public fileListOnLocal = [];
  public dataListOnLocal = [];
  public dataUploaded = [];
  public seqNumb = null;
  public localFolders = ['BackUp', 'To_AWS', 'From_AWS'];
  public Folders = {  'BackUp': false,
                      'To_AWS': false,
                      'From_AWS': false,
                  };
  public _dapDictionary = {};
  public checkerList = {};
  public statues = {'Cloud': false,
                    'Local': false,
                  }
  public existFiles = { 'Checkers.dap': false,
                        'stations.csv': false,
                        'TrainSpec.csv': false,
                        'seqFile.txt': false,
                      };
  public LocalData = [];
  public loading;

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, private file: File, public http: Http, private alertCtrl: AlertController, private device: Device, private platform: Platform) {
    this.platform.ready().then(() => {  
      //when the app is already launched, reads the assettag # of this device, 
      //if its a web simulator, make a fake assettag
      if (!(platform.is('core') || platform.is('mobileweb'))){
        this.assetTag = (window as any).device.name;
      }
      else {
        this.assetTag = 'AY1863';
      }
    })
  }

  mainController(): void{ 
    //handles the syncing process, such as update files and upload data

    this.presentLoadingDots();
    this.platform.ready().then(() => {
        // console.log('--------------------Start-------------------------');
        new Promise((res, rej) => {
          this.CheckMultiFolder(0,3,this.localFolders)
              .then(_ => {
                // console.log('finish check and make all dir');
                return Promise.resolve();
              })
              .then(_ => {
                // console.log('starting checking schedule on the cloud, will be returning a array of file on success, or cloud status false');
                // console.log('-------------------------2-------------------------');
                return this.CheckScheduleOnCloud();;
              })
              .then(res => {
                // console.log('starting checking schedule on the local, will be returning a array of file on success, or local status false');
                // console.log('-------------------------3-------------------------');
                return this.CheckScheduleOnLocal();
              })
              .then(res => {
                // console.log('starting download files if cloud status is true, and returns file to be stored in device on success, or error on fail, else reject');
                // console.log('-------------------------4-------------------------');
                if(this.statues['Cloud'] == true){
                  return this.DownloadAllFiles(0, this.fileListOnCloud.length, this.fileListOnCloud);
                }
                else{
                  return Promise.reject('Unable to find necessary files on the Cloud, Download failed')
                }
              })
              .catch(rej => {
                // console.log('ERROR: ' + rej);
              })
              .then(res => {
                // console.log('starting loading the seq# from file, if file not found, download from cloud, if both not found, prompt user to manually enter a seq#');
                // console.log('-------------------------5-------------------------');
                return this.LoadSeqFile();
              })
              .catch(rej => {
                // console.log('ERROR: ' + rej);
              })
              .then(res => {
                // console.log('starting checking leftover Data on the local, will be returning a array of file on success, or local status false');
                // console.log('-------------------------6-------------------------');
                return this.CheckDataOnLocal();
              })
              .then(res => {
                // console.log('Checking for leftover data, and returns true/false on success, and error on fail');
                // console.log('-------------------------7-------------------------');
                return this.CheckingForAvaliableData();
              })
              .catch(rej => {
                // console.log('WARNING: there are leftover data files that did not get pushed to the cloud')
              })
              .then(res => {
                // console.log('finish all conditions, if all folders and files exist, start survey, else pop alert')
                // console.log('-------------------------End-------------------------');
                if(this.existFiles['Checkers.dap'] && this.existFiles['stations.csv'] && this.existFiles['TrainSpec.csv'] && this.existFiles['seqFile.txt']){
                  this.loading.dismiss();
                  this.goToSignIn();
                }
                else{
                  this.loading.dismiss();
                  this.showNoFileAlert(res);
                }
              })
              .catch(err => {
                this.loading.dismiss();
                this.showNoFileAlert(err);
              })
        })
    })
  }

  //------------------------------------------------------------------------------
  //check for data files that were left over on the device, and push to the cloud.

  CheckingForAvaliableData(): Promise<any>{
    //list out all the file objects on saved on the To_AWS folder as array,  
    //and get the filename of each file, load them into another function to upload them.
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
                      return Promise.reject(rej);
                    })
  }

  UploadAllData(current: number, target: number, content: Array<string>): Promise<any>{
    //called recursivly to make sure each file are being uploaded.
    if(current == target){
      return Promise.resolve();
    }
    return this.UploadEachData(content[current])
                .then(res => {
                  return this.UploadAllData(current+1, target, content);
                })
                .catch(err => {
                  return this.UploadAllData(current+1, target, content);
                })
  }

  UploadEachData(thisFile: string): Promise<any>{
    //takes a single file and its content, and put it into AWS, and also move it to the backup folder,
    //so the To_AWS can be kept clean.
    return this.file.readAsText(this.file.documentsDirectory + 'To_AWS', thisFile)
                    .then(res => {
                      console.log(res);
                      return this.bucket.putObject({Bucket: 'ops-planning', Key: 'From_iPad/SubwayLoadCheck/' + thisFile, Body: res}, function(err, data){})
                                    .promise()
                                    .then(res => {
                                      return this.file.moveFile(this.file.documentsDirectory + 'To_AWS', thisFile, this.file.documentsDirectory + 'BackUp', thisFile)
                                                      .then(res => {
                                                        return Promise.resolve();
                                                      })
                                                      .catch(rej => {
                                                        return Promise.reject(rej);
                                                      });
                                    })
                                    .catch(rej => {
                                      return Promise.reject(rej);
                                    });
                    })
                    .catch(rej => {
                      return Promise.reject(rej);
                    });
  }

  //------------------------------------------------------------------------------

  DownloadAllFiles(current: number, target: number, content: Array<string>): Promise<any>{
    //this function is to download all the files that was previously found on AWS bucket using recursive calling
    let temp = content[current].lastIndexOf('/') + 1;
    let FileName = content[current].slice(temp, content[current].length);
    console.log(FileName);
    if(current == target){
      if(this.fileListOnCloud[0] != null){
        return Promise.resolve();
      }
      else{
        return Promise.reject('File does not exist on AWS');
      }
    }
    return this.DownLoadEachFile(FileName)
                .then(res => {
                  this.existFiles[FileName] = true;
                  return this.DownloadAllFiles(current+1, target, content);
                })
                .catch(err => {
                  return this.DownloadAllFiles(current+1, target, content);
                })
  }

  DownLoadEachFile(FileName: string): Promise<any>{
    //download a single file at a time by taking the filename as input, and match to the object name on AWS
    //then parse the url that was returned, and store the object data to the local device folder
    let url = this.bucket.getSignedUrl('getObject', {Bucket: 'ops-planning', Key: 'To_iPad/Shared/' + FileName});
    return this.http.get(url)
            .toPromise()
            .then(res => {
              return this.file.writeExistingFile(this.file.documentsDirectory + '/From_AWS', FileName, res['_body'])
                      .then(_ => {
                        return Promise.resolve();
                      })
                      .catch(err => {
                        return Promise.reject(err);
                      })
              })
              .catch(err => {
                return Promise.reject(err);
              });
  }

  //------------------------------------------------------------------------------

  LoadSeqFile(): Promise<any>{
    //this function will try to look for the seq # from the seqFile.txt, if find it, it will use that as the seq#,
    //if not, it will try to look for it on the AWS for backups, if both has no seq#, it will prompt the user 
    //if this is the first time that this app launch on this device, if yes, it will auto generate a file with
    //seq# = 1, if not, it will ask the user to manually input a seq#, and start a new count
    // let url = this.bucket.getSignedUrl('getObject', {Bucket: 'ops-planning', Key: 'To_iPad/' + this.assetTag + '/seqFile.txt'});
    // return this.http.get(url)
    //                 .toPromise()
    //                 .then(res => {
    //                   return this.file.writeExistingFile(this.file.documentsDirectory + '/From_AWS', 'seqFile.txt', res['_body'])
    //                                   .then(_ => {
    //                                     this.seqNumb = parseInt(res['_body']);
    //                                     this.existFiles['seqFile.txt'] = true;
    //                                     return Promise.resolve();
    //                                   })
    //                                   .catch(err => {
    //                                     this.seqNumb = parseInt(res['_body']);
    //                                     this.existFiles['seqFile.txt'] = true;
    //                                     return Promise.reject(err);
    //                                   })
    //                   })
    //                   .catch(err => {
    //                     return this.showNoSeqAlert()
    //                                 .then(res => {
    //                                   return Promise.reject(err);
    //                                 })
    //                                 .catch(rej => {
    //                                   return Promise.reject(rej);
    //                                 });
    //                   });
    let date = new Date();
    let month =("0" + (date.getMonth() + 1)).slice(-2).toString();

    let day = date.getDate().toString();
    let year = date.getFullYear().toString().substr(-2);
    let hour = date.getHours().toString();

    let min = date.getMinutes().toString();
    let secs = date.getSeconds().toString();
    let time = month+day+year+this.twoDigit(hour)+this.twoDigit(min)+this.twoDigit(secs);
    let timeString = time.toString();
    let name = this.deviceName.toString();
    this.seqNumb = name+timeString
    this.existFiles['seqFile.txt'] = true;
    return Promise.resolve();

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

  CheckScheduleOnCloud(): Promise<any>{
    //check for input files on AWS, and store them in an array.
    //folder or empty folder will also be recorded, but because they have no actual
    //data, it will not be downloaded
    return this.bucket.listObjects({Bucket: 'ops-planning', Prefix:'To_iPad/Shared/'}, function (err, result) {})
                .promise()
                .then(result => {
                      result['Contents'].forEach(element => {
                        this.fileListOnCloud.push(element['Key']);
                      });
                      this.statues['Cloud'] = true;
                      return Promise.resolve();
                  })
                .catch(rej => {
                  this.statues['Cloud'] = false;
                  this.errors += rej + '\n';
                  return Promise.resolve();
          });
    }

  CheckScheduleOnLocal(): Promise<any>{
    //check for all the necessary input files on the device, and store them in an array for later use.
    return this.file.listDir(this.file.documentsDirectory, 'From_AWS')
                    .then(result => {
                      result.forEach(element => {
                        this.fileListOnLocal.push(element);
                      });
                      this.statues['Local'] = true;
                      return Promise.resolve();
                    })
                    .catch(err => {
                      this.statues['Local'] = false;
                      return Promise.resolve();
                    });
  }

  CheckDataOnLocal(): Promise<any>{
    //check for left over data, and store them in the array for later upload.
    return this.file.listDir(this.file.documentsDirectory, 'To_AWS')
                    .then(result => {
                      result.forEach(element => {
                        this.dataListOnLocal.push(element);
                      });
                      this.statues['Local'] = true;
                      return Promise.resolve();
                    })
                    .catch(err => {
                      this.statues['Local'] = false;
                      return Promise.resolve();
                    });
  }

  //------------------------------------------------------------------------------

  CheckMultiFolder(current: number, target: number, content: Array<string>): Promise<any>{
    //check it all the necessary folders are in place, create them if not, these folder will be
    //needed when the app are trying to read/write the data
    if(current == target){
      if((this.Folders[content[0]] && this.Folders[content[1]] && this.Folders[content[2]]) == true){
        return Promise.resolve();
      }
      else{
        return Promise.reject('folder does not exist');
      }
    }
    return this.CheckEachFolder(content[current])
                .then(res => {
                  return this.CheckMultiFolder(current+1, target, content);
                })
                .catch(err => {
                  return this.CheckMultiFolder(current+1, target, content);
                })
  }

  CheckEachFolder(folder: string): Promise<any>{
    return this.file.checkDir(this.file.documentsDirectory, folder)
                    .then(res => {
                      this.Folders[folder] = true;
                      return Promise.resolve();
                    })
                    .catch(rej => {
                      return this.file.createDir(this.file.documentsDirectory, folder, false)
                                      .then(res => {
                                        this.Folders[folder] = true;
                                        return Promise.resolve();
                                      })
                                      .catch(rej => {
                                        return Promise.reject(rej);
                                      })
                    })
  }

  //------------------------------------------------------------------------------

  goToSignIn(): void{
    //move to the next page which is the signin page, and pass down the assettag# and seq#
    this.navCtrl.setRoot(SLCSignInPage, {
      assetTag: this.assetTag,
      seqNumb: this.seqNumb,
      bucket: this.bucket,
    });
  }

  showNoFileAlert(err: string): void{
    //alert pop up when the all the necessary files are not present
    let alert = this.alertCtrl.create({
      title: 'Unable to Proceed',
      subTitle: 'Missing Essential Files !'
                + '<br>Please make sure you '
                + '<br>have stable connection '
                + '<br>and try again later.',
      buttons: ['OK']
    });
    alert.present();
  }

  showNoSeqAlert(): Promise<any>{
    //alert pop up when no seq# found on both local and AWS
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: 'No Sequence Number Found',
        subTitle: "Asset Tag #: " + this.assetTag,
        buttons: [
          {
            text: 'OK',
            handler: (event: any) => {
              resolve(false);
            }
          },
        ],
        enableBackdropDismiss: false,
      });
      alert.present();
    })
  }

  showAddSeqAlert(): Promise<any>{
    //alert pop when user selects not first time launch, will prompt to enter a seq#
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: 'Please Type Sequence # Here',
        inputs: [
          {
            type: 'number',
            name: 'seqNumb',
            placeholder: 'Sequence # Here.'
          },
        ],
        buttons: [
          {
            text: 'Save',
            handler: (event: any) => {
              this.seqNumb = event.seqNumb;
              this.existFiles['seqFile.txt'] = true;
              alert.dismiss()
                    .then(() => {
                      this.existFiles['seqFile.txt'] = true;
                      return this.file.writeExistingFile(this.file.documentsDirectory + '/From_AWS', 'seqFile.txt', this.seqNumb)
                                      .then(_ => {
                                        return resolve();
                                      })
                                      .catch(err => {
                                        return resolve();
                                      });
                    });
            }
          }
        ],
        enableBackdropDismiss: false,
      });
      alert.present();
    })
  }

  presentLoadingDots(): void{
    //loading animation
    this.loading = this.loadingCtrl.create({
      spinner: 'dots',
      content: '<b>Loading... Please Wait.</b>',
      showBackdrop: false
    });
    this.loading.present();
  }

}
