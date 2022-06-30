import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler, IonicPageModule } from 'ionic-angular';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { IonicStorageModule } from '@ionic/storage';
import { FormsModule }   from '@angular/forms';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpModule } from '@angular/http';
import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';

import { SLC } from './app.component';
import { SLCSignInPage } from '../pages/SLCSignIn/SLCSignIn';
import { StationSelectionPage } from '../pages/StationSelection/StationSelection';
import { SLCpage } from '../pages/SLC/SLC';
import { ModalPage } from '../pages/modal-page/modal-page';
import { DigitModal } from '../pages/DigitModal/DigitModal';
import { SuperCheckInPage } from '../pages/SuperCheckIn/SuperCheckIn';
import { SLCEntryPage } from '../pages/SLCEntry/SLCEntry';


@NgModule({
  declarations: [
    SLC,
    StationSelectionPage,
    SLCSignInPage,
    SLCpage,
    ModalPage,
    DigitModal,
    SuperCheckInPage,
    SLCEntryPage,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    SignaturePadModule,
    AmplifyAngularModule,
    IonicPageModule.forChild(ModalPage),
    IonicPageModule.forChild(DigitModal),
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(SLC, {
      mode: 'md',
      activator: 'highlight',
    }
  )],
  bootstrap: [IonicApp],
  entryComponents: [
    SLC,
    StationSelectionPage,
    SLCSignInPage,
    SLCpage,
    ModalPage,
    DigitModal,
    SuperCheckInPage,
    SLCEntryPage,
  ],
  providers: [
    StatusBar,
    Device,
    SplashScreen,
    ScreenOrientation,
    AmplifyService,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
