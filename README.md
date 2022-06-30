# Subway Load Check

This Subway Load Check survey was build as hybrid mobile app using [Ionic 2](https://ionicframework.com/) on [Cordova](https://cordova.apache.org/) and [Angular 2](https://angular.io/)

## Before You Start

Install [Node.js](https://nodejs.org/en/) on your PC/Mac.

Then install Ionic by running the following command from you cmd/Terminal

```bash
$ sudo npm install -g ionic cordova
```

## How to run this app

Download the entire app on to your local device by downloading the zip or cloning

For GitLab Basics, click [here](https://docs.gitlab.com/ee/gitlab-basics/command-line-commands.html)

After getting all your files,

```bash
$ cd project_folder_location
```

If you want to run a quick demo on web plaform:

```bash
$ ionic serve
```

To build the app for iOS platform and run it on Xcode:

```bash
$ ionic cordova build ios
```

then open Xcode and Open Project on SubwayLoadCheck/platforms/ios.

Make sure that you signed the package with your developer license before building it.

Try to change the bundle name if signing fails.

### Run Using Simulator

To test the app using the Xcode iPad simulator, go to toolbar on the top of the screen of Xcode, click on <b>Product -> Destination -> iPad (5th generation)</b>,  then run the app.

### Run Using Actual Device

To run the app on a iPad, connect your device to the mac, and your device name should show up under the destination list, then run.

 Be aware that you need to select <b>trust this device</b> on both mac and the iPad, and also trust the developer. This part can be done by go into the iPad's <b>Setting -> General -> Device Management -> Trust This App</b>

##### Update

Due to the fact that this project will need access to read/write local files, and internet connection to cloud, it can no longer be tested using browser or simulator, it will only work on the actual iPad.

