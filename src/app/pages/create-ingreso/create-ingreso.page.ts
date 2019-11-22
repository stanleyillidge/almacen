import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data-service';
import { Documento, LocalDatabase, ListaDetallada } from 'src/app/models/data-models';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import * as firebase from 'firebase/app';
import 'firebase/database';

@Component({
  selector: 'app-create-ingreso',
  templateUrl: './create-ingreso.page.html',
  styleUrls: ['./create-ingreso.page.scss'],
})
export class CreateIngresoPage implements OnInit {
  ProveedoresControl = new FormControl();
  proveedores: string[] = [];
  filteredProveedores: Observable<string[]>;

  ProductoControl = new FormControl();
  productos: string[] = [];
  filteredProductos: Observable<string[]>;

  BodegasControl = new FormControl();
  bodegas: string[] = [];
  filteredBodegas: Observable<string[]>;

  CantidadControl = new FormControl();
  costoControl = new FormControl();
  estadoControl = new FormControl();
  
  newIngresoForm: FormGroup;
  accion:string;
  key: string;
  usuariost: {};
  usuarios: {};
  database: LocalDatabase;
  listaProductos:any = [];
  total: any;
  DocPushID: string;
  lista: {};
  disabled:boolean = false;
  documento: any;
  dataEdit: any;
  mov: string;
  TipoUsuario: string;
  disabledfab: boolean = false;
  
  constructor(
    public navCtrl: NavController,
    public alertController: AlertController,
    public fb: FormBuilder,
    public route: ActivatedRoute,
    public ds:  DataService
  ) {
    this.database = this.ds.Database
    this.total = {};
    this.lista = {};
    this.documento = {};
    this.total['costo'] = 0;
    this.total['unid'] = 0;
    this.listaProductos = [];
    this.accion = this.route.snapshot.paramMap.get('accion');
    this.mov = this.route.snapshot.paramMap.get('mov');
    this.TipoUsuario = 'cliente'
    if(this.mov == 'compra'){
      this.TipoUsuario = 'proveedor'
    }
    console.log(this.database.Documentos)
    this.actualiza(this.database)
    this.filteredProductos = this.ProductoControl.valueChanges
      .pipe(
        startWith(''),
        map(values => this._filterProductos(values))
      );
    this.filteredProveedores = this.ProveedoresControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterProveedores(value))
      );
    this.filteredBodegas = this.BodegasControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterBodegas(value))
      );
    console.log(this.mov,this.accion)
    if(this.accion =='crear'){
      this.creaFormularioVacio()
    }else{      
      this.key = this.route.snapshot.paramMap.get('key');
      this.DocPushID = this.key;
      console.log(this.key)
      this.creaFormulario(this.database.Documentos[this.key])
    }
  }
  editar(data){
    this.dataEdit = data;
    this.disabled = false;
    this.estadoControl.enable();
    let proveedor
    if(this.mov == 'compra'){
      proveedor = this.database.Usuarios[data.proveedor].nombre
    }else{
      proveedor = this.database.Usuarios[data.comprador].nombre
    }
    const producto = this.database.Productos[data.producto].nombre
    this.ProveedoresControl = new FormControl({value: proveedor, disabled: false});
    this.ProductoControl = new FormControl({value: producto, disabled: false});
    this.CantidadControl = new FormControl({value: data.cantidad, disabled: false});
    this.costoControl = new FormControl({value: data.costo, disabled: false});
    this.BodegasControl = new FormControl({value: data.bodega, disabled: false});
    this.actualiza(this.database)
  }
  borrar(data){
    console.log(data)
    for(let i in this.listaProductos){
      if(data.Total == this.listaProductos[i].Total){
        this.listaProductos.splice(i, 1);
        delete this.lista[data.key]
        this.total['costo'] -= data.Total
        this.total['unid'] -= data.cantidad;
        this.documento[this.DocPushID].valor = this.total['costo'];
        this.documento[this.DocPushID].numProductos = this.total['unid'];
        console.log(this.lista)
      }
    }
  }
  creaFormulario(data:Documento){
    console.log(data)
    this.disabled = true;
    this.disabledfab = true;
    this.DocPushID = data.key;
    let proveedor
    if(this.mov == 'compra'){
      proveedor = this.database.Usuarios[data.proveedor].nombre
    }else{
      proveedor = this.database.Usuarios[data.comprador].nombre
    }
    this.ProveedoresControl = new FormControl({value: proveedor, disabled: true});
    this.ProductoControl = new FormControl({value: '', disabled: true});
    this.CantidadControl = new FormControl({value: '', disabled: true});
    this.costoControl = new FormControl({value: '', disabled: true});
    this.BodegasControl = new FormControl({value: '', disabled: true});
    this.estadoControl.setValue(data.estado);
    // this.estadoControl.disable();
    for(let i in this.database.Listas){
      if(this.database.Listas[i].documento == data.key){
        this.listaProductos.unshift(this.database.Listas[i]);
        this.total['costo'] += (this.database.Listas[i].costo * this.database.Listas[i].cantidad)
        this.total['unid'] += this.database.Listas[i].cantidad;
      }
    }
  }
  creaFormularioVacio(){
    this.DocPushID = firebase.database().ref().push().key;
  }
  addProducto(){
    let comprador = this.getKeyByValue(this.usuarios[this.TipoUsuario], this.ProveedoresControl.value,'nombre');
    let proveedor = 'su empresa'
    if(this.mov == 'compra'){
      comprador = 'su empresa'
      proveedor = this.getKeyByValue(this.usuarios[this.TipoUsuario], this.ProveedoresControl.value,'nombre');
    }
    if(!this.disabled){
      if(!this.documento[this.DocPushID]){
        this.documento[this.DocPushID] = new Documento;
        this.documento[this.DocPushID].key = this.DocPushID;
        this.documento[this.DocPushID].creacion = new Date();
        this.documento[this.DocPushID].tipo = this.mov;
        this.documento[this.DocPushID].estado = 'pendiente';
        this.documento[this.DocPushID].numProductos = 0;
        this.documento[this.DocPushID].valor = 0;
        this.documento[this.DocPushID].comprador = 'su empresa';
        this.documento[this.DocPushID].usuario = 'usuario autenticado en la app'
      }
      const nombre = this.ProductoControl.value
      this.documento[this.DocPushID].proveedor = proveedor;
      this.documento[this.DocPushID].comprador = comprador;
      this.documento[this.DocPushID].estado = this.estadoControl.value;
      const cantidades = this.CantidadControl.value
      const costo = this.costoControl.value
      const key = firebase.database().ref().push().key;
      this.lista[key] = new ListaDetallada();
      for(let i in this.database.Productos){
        if(this.database.Productos[i].nombre == nombre){
          this.total['costo'] += (Number(costo) * Number(cantidades))
          this.total['unid'] += Number(cantidades);
          this.documento[this.DocPushID].valor = this.total['costo'];
          this.documento[this.DocPushID].numProductos = this.total['unid'];
          this.lista[key].key = key;
          this.lista[key].tipo = this.documento[this.DocPushID].tipo;
          this.lista[key].creacion = this.documento[this.DocPushID].creacion;
          this.lista[key].bodega = this.BodegasControl.value
          this.lista[key].documento = this.DocPushID;
          this.lista[key].proveedor = proveedor
          this.lista[key].comprador = comprador
          this.lista[key].usuario = 'usuario autenticado en la app'
          this.lista[key].producto = this.database.Productos[i].key;
          this.lista[key].precio = this.database.Productos[i].precio;
          this.lista[key].costo = Number(costo);
          this.lista[key].descuento = this.database.Productos[i].descuento;
          this.lista[key].cantidad = Number(cantidades);
          this.lista[key]['nombre'] = this.database.Productos[i].nombre;
          this.listaProductos.unshift(this.lista[key]);
          this.ProductoControl.setValue('');
          this.CantidadControl.setValue('');
          this.costoControl.setValue('');
          console.log(this.database)
        }
      }
    }else{
      this.DocPushID = this.key;
      const key = this.dataEdit.key;
      const nombre = this.ProductoControl.value
      this.documento[this.DocPushID].proveedor = proveedor;
      this.documento[this.DocPushID].comprador = comprador;
      this.documento[this.DocPushID].estado = this.estadoControl.value;
      const cantidades = this.CantidadControl.value
      const costo = this.costoControl.value
      this.lista[key] = new ListaDetallada();
      for(let i in this.database.Productos){
        if(this.database.Productos[i].nombre == nombre){
          this.total['costo'] += (Number(costo) * Number(cantidades))
          this.total['unid'] += Number(cantidades);
          this.documento[this.DocPushID].valor = this.total['costo'];
          this.documento[this.DocPushID].numProductos = this.total['unid'];
          this.lista[key].key = key;
          this.lista[key].tipo = this.documento[this.DocPushID].tipo;
          this.lista[key].creacion = this.documento[this.DocPushID].creacion;
          this.lista[key].bodega = this.BodegasControl.value
          this.lista[key].documento = this.DocPushID;
          this.lista[key].proveedor = proveedor
          this.lista[key].comprador = comprador
          this.lista[key].usuario = 'usuario autenticado en la app'
          this.lista[key].producto = this.database.Productos[i].key;
          this.lista[key].precio = this.database.Productos[i].precio;
          this.lista[key].costo = Number(costo);
          this.lista[key].descuento = this.database.Productos[i].descuento;
          this.lista[key].cantidad = Number(cantidades);
          this.lista[key]['nombre'] = this.database.Productos[i].nombre;
          this.listaProductos.unshift(this.lista[key]);
          this.ProductoControl.setValue('');
          this.CantidadControl.setValue('');
          this.costoControl.setValue('');
          console.log(this.database)
        }
      }
    }
  }
  async creaDocumento(){
    let este = this
    console.log(this.accion,this.estadoControl.value)
    if(this.accion == 'crear'){
      if(this.listaProductos.length>0){
        if(this.ProveedoresControl.value != ''){
          this.ds.creaIngreso(this.documento[this.DocPushID],this.lista).then(a=>{
            este.navCtrl.pop()
          })
        }else{
          this.ds.presentAlert('Error','debes elegir un proveedor y anexar producutos')
        }
      }else{
        this.ds.presentAlert('Error','debes elegir un proveedor y anexar producutos')
      }
    }else if(this.accion == 'editar' && (this.estadoControl.value == 'anulado')){
      this.documento[this.DocPushID] = this.database.Documentos[this.DocPushID]
      this.documento[this.DocPushID].estado = 'anulado'
      this.documento[this.DocPushID].observacion = ''
      const alert = await this.alertController.create({
        header: 'Observacion!',
        inputs: [
          {
            name: 'observacion',
            type: 'text',
            placeholder: 'Observacion'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Crear Cancel');
            }
          }, {
            text: 'Ok',
            handler: (d) => {
              this.documento[this.DocPushID].observacion = d.observacion
            }
          }
        ]
      });
      await alert.present();
    }
  }
  onClick(){
    if(this.accion == 'editar' && (this.estadoControl.value == 'anulado')){
      this.disabledfab = false;
    }
  }
  ngOnInit(){}
  actualiza(data){
    let este = this;
    este.usuariost = {};
    este.usuarios = {};
    if(data.Productos){
      Object.keys(data.Productos).map(function(i){
        este.productos.push(data.Productos[i].nombre)
      });
    }
    if(data.Usuarios){
      Object.keys(data.Usuarios).map(function(i){
        if(!este.usuarios[data.Usuarios[i].rol]){
          este.usuarios[data.Usuarios[i].rol]=[];
          este.usuariost[data.Usuarios[i].rol]=[];
        }
        este.usuarios[data.Usuarios[i].rol].push(data.Usuarios[i]);
        este.usuariost[data.Usuarios[i].rol].push(data.Usuarios[i]);
      });
    }
    if(data.Bodegas){
      Object.keys(data.Bodegas).map(function(i){
        este.bodegas.push(data.Bodegas[i].nombre)
      });
    }
    for(let i in this.usuarios[this.TipoUsuario]){
      this.proveedores.push(this.usuarios[this.TipoUsuario][i].nombre)
    }
  }
  getKeyByValue(objects, value,key) { 
    for(let i in objects){
      if(objects[i][key] == value){
        return objects[i].key
      }
    }
  }
  private _filterProveedores(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.proveedores.filter(option => option.toLowerCase().includes(filterValue));
  }
  private _filterProductos(values: string): string[] {
    const filterValues = values.toLowerCase();
    return this.productos.filter(options => options.toLowerCase().includes(filterValues));
  }
  private _filterBodegas(values: string): string[] {
    const filterValues = values.toLowerCase();
    return this.bodegas.filter(options => options.toLowerCase().includes(filterValues));
  }
}