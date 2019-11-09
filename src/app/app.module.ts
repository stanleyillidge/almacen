import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { DataService } from './models/data-service';

import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import * as firebase from 'firebase/app';

import { IonicStorageModule } from '@ionic/storage';
import { Camera } from '@ionic-native/camera/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { ImageResizer } from '@ionic-native/image-resizer/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyD-eQ5Z1rxGxJ0eSg_DUUr-G1_lggKVLfw",
  authDomain: "almacen-develop.firebaseapp.com",
  databaseURL: "https://almacen-develop.firebaseio.com",
  projectId: "almacen-develop",
  storageBucket: "almacen-develop.appspot.com",
  messagingSenderId: "361786075749",
  appId: "1:361786075749:web:6143f95df6dd9838dd748c",
  measurementId: "G-V3824B8EKJ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    ComponentsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    DataService,
    Camera,
    FileTransfer,
    File,
    ImageResizer,
    WebView
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
