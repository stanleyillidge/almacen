import { Injectable, NgZone } from '@angular/core';
// import * as firebase from 'firebase/app';
// import 'firebase/auth';
// import 'firebase/database';
// import 'firebase/functions';
import { Router } from "@angular/router";
import { LoadingController, AlertController, Platform, ToastController } from '@ionic/angular';
// Ionic Storage
// import { Storage } from '@ionic/storage';
import { ReplaySubject } from 'rxjs';
import { LocalDatabase } from './data-models';
// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
// import { File } from '@ionic-native/file/ngx';
// import { WebView } from '@ionic-native/ionic-webview/ngx';

@Injectable()
export class DataService {
    // public SedesObserver: ReplaySubject<any> = new ReplaySubject<any>();
    // public UbicacionesObserver: ReplaySubject<any> = new ReplaySubject<any>();
    // public SubUbicacionesObserver: ReplaySubject<any> = new ReplaySubject<any>();
    // public ArticuloBaseObserver: ReplaySubject<any> = new ReplaySubject<any>();
    // public ArticulosObserver: ReplaySubject<any> = new ReplaySubject<any>();
    database: LocalDatabase;
    plataforma: any = {desktop:Boolean,android:Boolean};
    looper:number = 0;
    constructor(
        public platform: Platform,
        public alertController: AlertController,
        public toastController: ToastController,
        public router: Router,
        public loadingController: LoadingController,
        public ngZone: NgZone, // NgZone service to remove outside scope warning
        // private webview: WebView,
        // private fileTransfer: FileTransfer,
        // private file: File,
        // private storage: Storage
    ) {
        let este = this;
        // console.log(this.platform)
        this.plataforma.desktop = this.platform.is("desktop");
        this.plataforma.android = this.platform.is("android");
        this.plataforma.cordova = this.platform.is("cordova");
        // this.storage.clear();// quitar cuando este en produccion
    }
}