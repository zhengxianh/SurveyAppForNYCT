import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { File } from '@ionic-native/file';

import { SLCEntryPage } from '../pages/SLCEntry/SLCEntry';


@Component({
  templateUrl: 'app.html',
})
export class SLC {
  rootPage:any = SLCEntryPage;

  constructor(platform: Platform, screenOrientation: ScreenOrientation, statusBar: StatusBar, splashScreen: SplashScreen, public file: File,) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (!(platform.is('core') || platform.is('mobileweb'))){
        //device-specific code, such as detecting screen rotation
        screenOrientation.lock(screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY);
      }
      else {
        //desktop browser only code
        screenOrientation.ORIENTATIONS.PORTRAIT;   
      }
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
