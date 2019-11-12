import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { File } from '@ionic-native/file/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer/ngx';
import { DataService } from 'src/app/services/data-service';
import { Bodega } from 'src/app/models/data-models';

@Component({
  selector: 'app-create-bodega',
  templateUrl: './create-bodega.page.html',
  styleUrls: ['./create-bodega.page.scss'],
})
export class CreateBodegaPage implements OnInit {
  newBodegaForm: FormGroup;
  accion:string;
  Path: any = "/assets/shapes.svg";
  imagen: File | Blob | Uint8Array;
  key: string;
  Bodega: any;
  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    public route: ActivatedRoute,
    public ds:  DataService,
    private camera: Camera,
    private imageResizer: ImageResizer,
    private file: File,
  ) {
    this.accion = this.route.snapshot.paramMap.get('accion');
    if(this.accion =='crear'){
      this.creaFormularioVacio()
    }else{
      this.key = this.route.snapshot.paramMap.get('key');
      this.Bodega = this.ds.Database.Bodegas[this.key];
      console.log(this.Bodega)
      this.creaFormulario(this.Bodega)
    }
  }
  creaFormulario(data){
    //-------------------
      this.newBodegaForm = this.fb.group({
        imagen: new FormControl(data.imagen, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        nombre: new FormControl(data.nombre, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        descripcion: new FormControl(data.descripcion, Validators.compose([Validators.required])),
        largo: new FormControl(data.largo, Validators.compose([Validators.required])),
        ancho: new FormControl(data.ancho, Validators.compose([Validators.required])),
        alto: new FormControl(data.alto, Validators.compose([Validators.required])),
        cantidad: new FormControl(data.cantidad, Validators.compose([Validators.required]))
      });
    //-------------------
  }
  creaFormularioVacio(){
    let data = new Bodega
    data.imagen = "/assets/shapes.svg";
    data.nombre = '';
    data.descripcion = '';
    data.largo = 0;
    data.ancho = 0;
    data.alto = 0;
    data.cantidad = 0;
    this.creaFormulario(data);
  }
  creaBodega(){
    let este = this;
    // console.log('Se envia',this.newBodegaForm.value,this.imagen,this.accion,this.key)
    this.ds.creaChild(this.newBodegaForm.value,this.imagen,this.accion,this.key,'bodegas').then(()=>{
      este.navCtrl.pop()
    })
  }
  camara(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
     // imageData is either a base64 encoded string or a file URI
     // If it's base64 (DATA_URL):
     let options = {
      uri: imageData,
      quality: 100,
      width: 700,
      height: 300
     } as ImageResizerOptions;
     
     this.imageResizer
       .resize(options)
       .then((filePath: string) => {
         this.Path = filePath;
          this.file.resolveLocalFilesystemUrl(filePath).then((entry:any)=>{
            entry.file((file1)=>{
              // this.imagen = <File>file1;
              var reader = new FileReader();
              reader.onload =  (encodedFile: any)=>{
                var src = encodedFile.target.result;
                this.newBodegaForm.value.imagen = src;
                this.imagen = this.convertDataUrlToBlob(src)
              }
              reader.readAsDataURL(file1);   
            })
          }).catch((error)=>{
            console.log(error);
          })
         console.log('FilePath => ', filePath)
        })
       .catch(e => console.log(e));

    }, (err) => {
     // Handle error
     console.log(err)
    });
  }
  convertDataUrlToBlob(dataUrl): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], {type: mime});
  }
  onFile(e) {
    let este = this;
    this.imagen = <File>e.target.files[0];

    let reader = new FileReader();

    reader.onload = function(e) {
      let src: any = e.target["result"];
      este.newBodegaForm.value.imagen = src;
      let data = este.newBodegaForm.value
      data['imagen'] =src;
      este.creaFormulario(data);
    };
    reader.readAsDataURL(e.target.files[0]);
  }
  ngOnInit() {
  }

}