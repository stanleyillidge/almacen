import { Injectable, NgZone } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/functions';
import { Router } from "@angular/router";
import { LoadingController, AlertController, Platform, ToastController } from '@ionic/angular';
// Ionic Storage
import { Storage } from '@ionic/storage';
import { ReplaySubject } from 'rxjs';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { LocalDatabase, Producto } from './data-models'; // hola stanley - jaider

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
        private webview: WebView,
        private fileTransfer: FileTransfer,
        private file: File,
        private storage: Storage
    ) {
        let este = this;
        this.plataforma.desktop = this.platform.is("desktop");
        this.plataforma.android = this.platform.is("android");
        this.plataforma.cordova = this.platform.is("cordova");
        // this.storage.clear();// quitar cuando este en produccion
    }
    // ---- Imagenes ----------------------------------------------
        /* async creaProducto(formulario:any,articulo:Producto,src:Uint8Array | Blob,newEtiqueta:boolean) {
            let este = this
            const loading = await this.loadingController.create({
                message: 'Actualizando...'
            });
            await loading.present();
            let nombre = formulario.nombre+'.'+src['type'].substr("image/".length);
            console.log('imagen',nombre,src)
            const imagenes = firebase.storage().ref('productos')
            .child(nombre)
            const metadata = {
                contentType: src['type']
            };
            await imagenes.put(src,metadata).then(async function(snapshot) {
                await imagenes.getDownloadURL().then(async function(url) {
                    // hago copia de respaldo por modificación
                    let updatekey = firebase.database().ref('modificaciones').push().key
                    // ---- Actualizo la data local antes de escribirlo --------
                        articulo.imagen = url;
                        articulo.disponibilidad = formulario.disponibilidad;
                        articulo.estado = formulario.estado;
                        articulo.descripcion = formulario.descripcion;
                        articulo.observaciones = formulario.observaciones;
                        articulo.valor = formulario.valor;
                        articulo.serie = formulario.serie;
                        articulo.modificaciones = new Date().toLocaleDateString();
                        articulo.nombre = este.database.ArticulosBase[articulo.articulo].nombre;
                        este.database.Articulos[articulo.key] = articulo; // data local
                    // ---- Actualiza Etiqueta de ser necesario ----
                        if(newEtiqueta){
                            este.crearEtiqueta(articulo)
                        }
                        console.log('ojo entro!',articulo);
                    // ---- Registro de modificaciones -------------
                        firebase.database().ref('modificaciones')
                        .child(articulo.key).child(updatekey).set(articulo)
                        firebase.database().ref('modificaciones')
                        .child(articulo.key).child(updatekey).child('modificaciones').push(updatekey)
                    // ---- Actualizacion de los datos -------------
                        await firebase.database().ref('inventario2')
                        .child(articulo.key).update(articulo);
                    // ---- Actualiza la tabla de seriales ---------
                        if(articulo.serie != ''){
                            await firebase.database().ref('seriales')
                            .child(articulo.serie).set({
                                articulokey: articulo.key,
                                subUbicacionkey: articulo.subUbicacion
                            })
                        }
                    // ---- Guardo localmente ----------------------
                        este.storage.set('database', JSON.stringify(este.database)).then(()=>{
                            loading.dismiss();
                        });
                    // ---------------------------------------------
                    return
                }).catch(function(error) {
                    // A full list of error codes is available at
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    switch (error.code) {
                        case 'storage/object-not-found':
                            console.log('storage/object-not-found')
                            // File doesn't exist
                            break;
                
                        case 'storage/unauthorized':
                            console.log('storage/unauthorized')
                            // User doesn't have permission to access the object
                            break;
                
                        case 'storage/canceled':
                            console.log('storage/canceled')
                            // User canceled the upload
                            break;
                
                        case 'storage/unknown':
                            console.log('storage/unknown')
                            // Unknown error occurred, inspect the server response
                            break;
                    }
                    return
                });
            });
        }*/
    // ------------------------------------------------------------
}