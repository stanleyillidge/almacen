import { Injectable, NgZone } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/functions';
import 'firebase/storage';
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
    public ProductoObserver: ReplaySubject<any> = new ReplaySubject<any>();
    // public UbicacionesObserver: ReplaySubject<any> = new ReplaySubject<any>();
    // public SubUbicacionesObserver: ReplaySubject<any> = new ReplaySubject<any>();
    // public productoBaseObserver: ReplaySubject<any> = new ReplaySubject<any>();
    // public productosObserver: ReplaySubject<any> = new ReplaySubject<any>();
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
        this.storage.clear();// quitar cuando este en produccion
    }
    // ---- Database ----------------------------------------------
        async initDatabase(){
            let este = this
            if(this.plataforma.cordova){
                this.checkDir()
            }
            await this.storage.get('database').then(async (val) => {
                if(val){
                    let datax = val;
                    if(!this.IsJsonString(val)){
                        datax = JSON.stringify(val);
                    }
                    await this.cargaModelos(JSON.parse(datax)).then((r)=>{
                        // console.log(r)
                        este.database = r
                        console.log('Si hay data',este.database);
                        este.databaseEvents('Productos')
                        // return true
                    })
                }else{
                    console.log('No hay datos almacenados');
                    este.decargaDatabase().then(()=>{
                        este.databaseEvents('Productos')
                    })
                    // return false
                }
                return
            });
        }
        async decargaDatabase(){
            let este = this;
            const loading = await this.loadingController.create({
                spinner:"dots",//"lines",//"circles",//"bubbles",
                translucent: true,
                cssClass: 'backRed'
            });
            await loading.present();
            this.database = new LocalDatabase;
            await firebase.database().ref('productos').once('value', function(productos){
                este.database.Productos = {}
                productos.forEach(producto=>{
                    const modelo = new Producto();
                    este.database.Productos[producto.key] = este.iteraModelo(modelo, producto.val());
                    este.download(este.database.Productos[producto.key]).then(r=>{
                        // console.log(r)
                        este.database.Productos[producto.key].imagen = r
                    })
                })
            }).then(()=>{
                este.storage.set('database', JSON.stringify(este.database)).then(()=>{
                    console.log('Database:',este.database)
                    loading.dismiss();
                    return
                })
            });
        }
        get Database(){
            return this.database
        }
        iteraModelo(modelo: any, data: any) {
            // console.log(modelo,data)
            Object.keys(modelo).forEach(i => {
                // console.log('campo',data[i],modelo[i])
                if (typeof data[i] !== 'undefined') {
                    modelo[i] = data[i];
                }
            });
            return modelo
        }
        async cargaModelos(data){
            let este = this
            este.database = new LocalDatabase
            // console.log('Your data is', este.database);
            este.database.Productos = {}
            Object.keys(data.Productos).forEach(key=>{
                const modelo = new Producto;
                este.database.Productos[key] = este.iteraModelo(modelo, data.Productos[key]);
            })
            return este.database
        }
        databaseEvents(campo:string){
            let este = this;
            let child = campo.toLowerCase();
            firebase.database().ref(child).limitToLast(1).on('child_added', function(added){
                este.eventos(added.val(),added.key,'added',campo)
            });
            firebase.database().ref(child).on('child_changed', function(change){
                este.eventos(change.val(),change.key,'change',campo)
            });
            firebase.database().ref(child).on('child_removed', function(removed){
                console.log('Evento','remover',campo)
                delete este.database[campo][removed.key]
                este.storage.set('database', JSON.stringify(este.database));
                switch (campo) {
                    case 'Productos':
                        este.ProductoObserver.next(este.database);
                        break;
                
                    default:
                        break;
                }
            });
        }
        eventos(data:any,key,tipo:String,campo:string){
            let este = this;
            console.log('Evento',tipo,campo,este.database[campo][key])
            let modelo
            let observer
            switch (campo) {
                case 'Productos':
                    modelo = new Producto();
                    observer = este.ProductoObserver;
                    break;
            
                default:
                    break;
            }
            este.database[campo][key] = este.iteraModelo(modelo,data);
            este.storage.set('database', JSON.stringify(este.database));
            observer.next(este.database);
        }
    // ---- Imagenes ----------------------------------------------
        public async download(producto:any){//(i:any,index:any,item:any) {
            let este = this;
            // console.log(c + name + '.png',producto)
            if (this.plataforma.cordova && this.plataforma.android) {
                return await this.downloadFile(producto)
            }else{
                return producto.imagen
            }
        }
        public async checkFileExists(producto:any){
            let este = this;
            let name = producto.key;
            await this.file.checkFile(this.file.externalRootDirectory, 'inventarios/' + name + '.png')
            .then(_ => {
                // alert("A file with the same name already exists!");
                console.log("A file with the same name already exists!");
                return true
            })
            // File does not exist yet, we can save normally
            .catch(err =>{
                return false
            })
        }
        public async downloadFile(producto:any){
            const fileTransfer: FileTransferObject = this.fileTransfer.create();
            let este = this;
            let name = producto.key;
            let file = producto.imagen;
            let c = 'inventarios/';
            return await fileTransfer.download(file, este.file.externalRootDirectory + '/'+ c + name + '.png')
            .then((entry) => {
                return este.webview.convertFileSrc(entry.nativeURL);
            })
            .catch((err) =>{
                console.log(producto.key,'Error saving file: ' + err.message);
                return producto.imagen
            })
        }
        async checkDir(){
            let este = this;
            return await this.file.checkDir(this.file.externalRootDirectory, 'inventarios').then(()=>{
                console.log('El directorio si existe')
            }).catch(
                // Directory does not exists, create a new one
                err => este.file.createDir(este.file.externalRootDirectory, 'inventarios', false)
                .then(response => {
                    // alert('New folder created:  ' + response.fullPath);
                    console.log('New folder created:  ' + response.fullPath);
                }).catch(err => {
                    // alert('It was not possible to create the dir "inventarios". Err: ' + err.message);
                    console.log('It was not possible to create the dir "inventarios". Err: ' + err.message);
                })			
            );
        }
    // ---- Productos ---------------------------------------------
        async creaProducto(formulario:any,src:any,accion:string,ProductoPushID:string) {
            let este = this
            const loading = await this.loadingController.create({
                // message: 'Trabajando...',
                spinner:"dots",
                translucent: true,
                cssClass: 'backRed'
            });
            await loading.present();
            let url = src
            if(accion == 'crear' || (src instanceof File) || (src instanceof Blob)){
                if(!ProductoPushID){ ProductoPushID = firebase.database().ref().push().key }
                await this.uploadImagen(formulario,src,ProductoPushID).then( u=>{
                    loading.dismiss();
                    este.presentToastWithOptions('Producto creado correctamente',3000,'top')
                    return
                })
            }else{
                // console.log('Producto a ser guardado 1',formulario, ProductoPushID, url)
                await este.actualizaProducto(formulario, ProductoPushID, url).then(()=>{
                    // ---- Guardo localmente ----------------------
                        este.storage.set('database', JSON.stringify(este.database)).then(()=>{
                            loading.dismiss();
                            este.presentToastWithOptions('Producto creado correctamente',3000,'top')
                        });
                    // ---------------------------------------------
                })
            }
        }
        async actualizaProducto(formulario: any, ProductoPushID: string, url: any){
            let este = this
            let producto = new Producto
            // ---- Actualizo la data local antes de escribirlo --------
                producto.key = ProductoPushID
                producto.imagen = url;
                producto.disponibilidad = formulario.disponibilidad;
                producto.descripcion = formulario.descripcion;
                producto.precio = formulario.precio;
                producto.creacion = new Date();
                producto.nombre = formulario.nombre;
                producto.largo = formulario.largo;
                producto.ancho = formulario.ancho;
                producto.alto = formulario.alto;
                producto.descuento = formulario.descuento;
                producto.cantidad = formulario.cantidad;

                este.database.Productos[producto.key] = producto;                            
                // console.log('ojo entro!',producto);
            // ---- Actualizacion de los datos -------------
                await firebase.database().ref('productos')
                .child(producto.key).update(producto);
            // ---------------------------------------------
        }
        async uploadImagen(formulario:any,src:any,ProductoPushID:string){
            let este = this
            try{
                let nombre = formulario.nombre+'.'+src['type'].substr("image/".length);
                // console.log('imagen',nombre,src)
                const imagenes = firebase.storage().ref('productos').child(nombre)
                const metadata = {
                    contentType: src['type']
                };
                await imagenes.put(src,metadata).then(async function(snapshot) {
                    await imagenes.getDownloadURL().then(async function(url) {
                        // hago copia de respaldo por modificación
                        // console.log('Producto a ser guardado 0',formulario, ProductoPushID, url)
                        await este.actualizaProducto(formulario, ProductoPushID, url).then(()=>{
                            // ---- Guardo localmente ----------------------
                            return este.storage.set('database', JSON.stringify(este.database))
                            // ---------------------------------------------
                        })
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
            }
            catch(error) {
                this.presentAlert('Error',error)
                console.error(error);
            }
        }
    // ---- Generales ---------------------------------------------
        IsJsonString(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }
        async presentAlert(titulo,mensaje) {
            const alert = await this.alertController.create({
            header: titulo,
            message: mensaje,
            buttons: ['OK']
            });
            await alert.present();
        }
        async presentToastWithOptions(message,duration,position) {
            const toast = await this.toastController.create({
            message: message,
            // showCloseButton: true,
            position: position,
            duration: duration
            // closeButtonText: 'Done'
            });
            toast.present();
        }
    // ------------------------------------------------------------
}