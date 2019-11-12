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
import { LocalDatabase, Producto, Bodega, Inventario } from './data-models'; // hola stanley - jaider

@Injectable()
export class DataService {
    public ProductoObserver: ReplaySubject<any> = new ReplaySubject<any>();
    public BodegaObserver: ReplaySubject<any> = new ReplaySubject<any>();
    public InventarioObserver: ReplaySubject<any> = new ReplaySubject<any>();
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
        // this.storage.clear();// quitar cuando este en produccion
    }
    // ---- Database ----------------------------------------------
        async initDatabase(){
            let este = this
            if(this.plataforma.cordova){
                this.checkDir()
            }
            this.database = new LocalDatabase;
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
                        este.databaseEvents('Bodegas')
                        // return true
                    })
                }else{
                    console.log('No hay datos almacenados');
                    this.decargaDatabase('bodegas').then(()=>{
                        este.decargaDatabase('productos').then(()=>{
                            este.storage.set('database', JSON.stringify(este.database)).then(()=>{
                                console.log('Database:',este.database)
                                return
                            })
                        });
                    })
                    // return false
                }
                return
            });
        }
        async decargaDatabase(child: string){
            let este = this;
            const loading = await this.loadingController.create({
                spinner:"dots",//"lines",//"circles",//"bubbles",
                translucent: true,
                cssClass: 'backRed'
            });
            await loading.present();
            let modelo
            let campo = this.capitalize(child)
            await firebase.database().ref(child).once('value', function(snapshots){
                este.database[campo] = {}
                snapshots.forEach(snapshot=>{
                    switch (child) {
                        case 'productos':
                            modelo = new Producto();
                            break;
                        case 'bodegas':
                            modelo = new Bodega();
                            break;
                        default:
                            break;
                    }
                    este.database[campo][snapshot.key] = este.iteraModelo(modelo, snapshot.val());
                    este.download(este.database[campo][snapshot.key]).then(r=>{
                        // console.log(r)
                        este.database[campo][snapshot.key].imagen = r
                    })
                })
            }).then(()=>{
                este.databaseEvents(campo);
                loading.dismiss()
            });
        }
        get Database(){
            return this.database
        }
        iteraModelo(modelo: any, data: any) {
            // console.log(modelo,data)
            Object.keys(modelo).forEach(i => {
                // console.log('campo',i)
                if (typeof data[i] !== 'undefined') {
                    modelo[i] = data[i];
                }
            });
            return modelo
        }
        async cargaModelos(data){
            let este = this
            // console.log('Your data is', este.database);
            if(data.Productos){
                este.database.Productos = {}
                Object.keys(data.Productos).forEach(key=>{
                    const modelo = new Producto;
                    este.database.Productos[key] = este.iteraModelo(modelo, data.Productos[key]);
                })
                este.databaseEvents('Productos')
            }
            if(data.Bodegas){
                este.database.Bodegas = {}
                Object.keys(data.Bodegas).forEach(key=>{
                    const modelo = new Bodega;
                    este.database.Bodegas[key] = este.iteraModelo(modelo, data.Bodegas[key]);
                })
                este.databaseEvents('Bodegas')
            }
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
                    case 'Bodegas':
                        este.BodegaObserver.next(este.database);
                        break
                    default:
                        break;
                }
            });
        }
        eventos(data:any,key,tipo:String,campo:string){
            let este = this;
            console.log('Evento',tipo,campo,key,este.database[campo])
            let modelo
            let observer
            switch (campo) {
                case 'Productos':
                    modelo = new Producto();
                    observer = este.ProductoObserver;
                    break;
                case 'Bodegas':
                    modelo = new Bodega();
                    observer = este.BodegaObserver
                    break;
                case 'Inventario':
                    modelo = new Inventario();
                    observer = este.InventarioObserver
                    break
                default:
                    break;
            }
            este.database[campo][key] = este.iteraModelo(modelo,data);
            console.log('Datbase a guardar',este.database)
            este.storage.set('database', JSON.stringify(este.database)).then(()=>{
                observer.next(este.database);
            })
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
    // ---- Productos | Bodegas -----------------------------------
        async creaChild(formulario:any,imagen:any,accion:string,PushID:string,child:string) {
            let este = this
            const loading = await this.loadingController.create({
                // message: 'Trabajando...',
                spinner:"dots",
                translucent: true,
                cssClass: 'backRed'
            });
            await loading.present();
            if(accion == 'crear' || (imagen instanceof File) || (imagen instanceof Blob)){
                if(!PushID){ PushID = firebase.database().ref().push().key }
                await this.uploadImagen(formulario,imagen,PushID,child).then( u=>{
                    loading.dismiss();
                    este.presentToastWithOptions('Termino correctamente',3000,'top')
                    return
                })
            }else{
                // console.log('Producto a ser guardado 1',formulario, PushID, imagen)
                await este.actualizaChild(formulario, PushID, imagen, child).then(()=>{
                    // ---- Guardo localmente ----------------------
                        este.storage.set('database', JSON.stringify(este.database)).then(()=>{
                            loading.dismiss();
                            este.presentToastWithOptions('Termino correctamente',3000,'top')
                        });
                    // ---------------------------------------------
                })
            }
        }
        async uploadImagen(formulario:any,imagen:any,PushID:string,child:string){
            let este = this
            try{
                let nombre = formulario.nombre+'.'+imagen['type'].substr("image/".length);
                console.log('imagen',nombre,imagen)
                const imagenes = firebase.storage().ref(child).child(nombre)
                const metadata = {
                    contentType: imagen['type']
                };
                await imagenes.put(imagen,metadata).then(async function(snapshot) {
                    await imagenes.getDownloadURL().then(async function(url) {
                        // hago copia de respaldo por modificación
                        console.log('Producto a ser guardado 0',child,formulario, PushID, url)
                        await este.actualizaChild(formulario, PushID, url, child).then(()=>{
                            // ---- Guardo localmente ----------------------
                            console.log('db',este.database)
                            este.storage.set('database', JSON.stringify(este.database)).then(()=>{
                                return true
                            })
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
        async actualizaChild(formulario: any, PushID: string, imagen: any, child: string){
            let este = this
            let modelo
            let observer
            let data
            const campo = this.capitalize(child)
            switch (child) {
                case 'productos':
                    modelo = new Producto();
                    observer = este.ProductoObserver;
                    if(este.database.Productos){
                        data = este.database.Productos
                    }else{
                        este.database.Productos = {}
                        data = este.database.Productos
                    }
                    break;
                case 'bodegas':
                    modelo = new Bodega();
                    observer = este.BodegaObserver;
                    // data = este.database.Bodegas
                    if(este.database.Bodegas){
                        data = este.database.Bodegas
                    }else{
                        este.database.Bodegas = {}
                        data = este.database.Bodegas
                    }
                    break;
            
                default:
                    break;
            }
            if(!imagen){
                imagen = data[PushID].imagen
            }
            // ---- Actualizo la data local antes de escribirlo --------
                console.log('actualiza',campo,formulario,PushID,imagen,modelo,data)
                data[PushID] = este.iteraModelo(modelo, formulario);
                data[PushID].key = PushID
                data[PushID].imagen = imagen;
                data[PushID].creacion = new Date();

                este.database[campo][PushID] = data[PushID];
                console.log('ojo entro!',data[PushID]);
            // ---- Actualizacion de los datos -------------
                await firebase.database().ref(child)
                .child(PushID).update(data[PushID]).catch(error=>{
                    este.presentAlert('Error',error)
                    console.error(error);
                })
            // ---------------------------------------------
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
        capitalize(s){
            if (typeof s !== 'string') return ''
            return s.charAt(0).toUpperCase() + s.slice(1)
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