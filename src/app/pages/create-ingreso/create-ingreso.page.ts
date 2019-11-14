import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data-service';
import { Documento } from 'src/app/models/data-models';

@Component({
  selector: 'app-create-ingreso',
  templateUrl: './create-ingreso.page.html',
  styleUrls: ['./create-ingreso.page.scss'],
})
export class CreateIngresoPage implements OnInit {
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  newIngresoForm: FormGroup;
  accion:string;
  key: string;
  ingreso: any;
  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    public route: ActivatedRoute,
    public ds:  DataService
  ) {
    this.accion = this.route.snapshot.paramMap.get('accion');
    if(this.accion =='crear'){
      this.creaFormularioVacio()
    }else{
      this.key = this.route.snapshot.paramMap.get('key');
      this.ingreso = this.ds.Database.Documentos[this.key];
      console.log(this.ingreso)
      this.creaFormulario(this.ingreso)
    }
  }
  creaFormulario(data){
    //---------------------------------------
      this.newIngresoForm = this.fb.group({
        tipo: new FormControl(data.tipo, Validators.compose([Validators.required])),
        estado: new FormControl(data.estado, Validators.compose([Validators.required])),
        numProductos: new FormControl(data.numProductos, Validators.compose([Validators.required])),
        proveedor: new FormControl(data.proveedor, Validators.compose([Validators.required])),
        comprador: new FormControl(data.comprador, Validators.compose([Validators.required])),
        usuario: new FormControl(data.usuario, Validators.compose([Validators.required])),
        ListaDetallada: new FormControl(data.ListaDetallada, Validators.compose([Validators.required]))
      });
    //---------------------------------------
  }
  creaFormularioVacio(){
    let data = new Documento
    data.key = ''
    data.tipo = 'ingreso'
    data.creacion = new Date()
    data.estado = 'pendiente'
    data.numProductos = 0
    data.proveedor = ''
    data.comprador = ''
    data.usuario = ''
    data.ListaDetallada = ''
    this.creaFormulario(data);
  }
  creaDocumento(){
    let este = this;
    this.ingreso = this.newIngresoForm.value;
    this.ingreso['uid'] = this.key;
    this.ingreso.key = this.key;
    // this.ds.CloudFunctionDocumentos(this.ingreso,this.accion).then(()=>{
    //   este.navCtrl.pop()
    // })
  }
  ngOnInit() {
  }

}