import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
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
  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    public route: ActivatedRoute,
    public ds:  DataService
  ) {
    this.database = this.ds.Database
    this.total = {};
    this.lista = {};
    this.total['costo'] = 0;
    this.total['unid'] = 0;
    this.listaProductos = [];
    // this.database = this.ds.Database
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
    this.accion = this.route.snapshot.paramMap.get('accion');
    console.log(this.accion)
    if(this.accion =='crear'){
      this.creaFormularioVacio()
    }else{      
      this.key = this.route.snapshot.paramMap.get('key');
      console.log(this.key)
      this.creaFormulario(this.database.Documentos[this.key])
    }
  }
  creaFormulario(data:Documento){
    console.log(data)
    this.disabled = true;
    const proveedor = this.database.Usuarios[data.proveedor].nombre
    this.ProveedoresControl = new FormControl({value: proveedor, disabled: true});
    this.ProductoControl = new FormControl({value: '', disabled: true});
    this.CantidadControl = new FormControl({value: '', disabled: true});
    this.costoControl = new FormControl({value: '', disabled: true});
    this.estadoControl.setValue(data.estado);
    this.estadoControl.disable();
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
    if(!this.database.Documentos){
      this.database.Documentos = {};
    }
  }
  addProducto(){
    if(!this.database.Documentos[this.DocPushID]){
      this.database.Documentos[this.DocPushID] = new Documento;
      this.database.Documentos[this.DocPushID].key = this.DocPushID;
      this.database.Documentos[this.DocPushID].creacion = new Date();
      this.database.Documentos[this.DocPushID].tipo = 'ingreso';
      this.database.Documentos[this.DocPushID].estado = 'pendiente';
      this.database.Documentos[this.DocPushID].numProductos = 0;
      this.database.Documentos[this.DocPushID].valor = 0;
      this.database.Documentos[this.DocPushID].comprador = 'su empresa';
      this.database.Documentos[this.DocPushID].usuario = 'usuario autenticado en la app'
    }
    const nombre = this.ProductoControl.value
    const proveedor = this.getKeyByValue(this.usuarios['proveedor'], this.ProveedoresControl.value,'nombre');
    this.database.Documentos[this.DocPushID].proveedor = proveedor;
    this.database.Documentos[this.DocPushID].estado = this.estadoControl.value;
    const cantidades = this.CantidadControl.value
    const costo = this.costoControl.value
    const key = firebase.database().ref().push().key;
    this.lista[key] = new ListaDetallada();
    for(let i in this.database.Productos){
      if(this.database.Productos[i].nombre == nombre){
        this.total['costo'] += (Number(costo) * Number(cantidades))
        this.total['unid'] += Number(cantidades);
        this.database.Documentos[this.DocPushID].valor = this.total['costo'];
        this.database.Documentos[this.DocPushID].numProductos = this.total['unid'];
        this.lista[key].key = key;
        this.lista[key].tipo = this.database.Documentos[this.DocPushID].tipo;
        this.lista[key].creacion = this.database.Documentos[this.DocPushID].creacion;
        this.lista[key].bodega = 'por definir'
        this.lista[key].documento = this.DocPushID;
        this.lista[key].proveedor = proveedor
        this.lista[key].comprador = 'su empresa'
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
  creaDocumento(){
    let este = this
    // console.log(this.database)
    if(this.listaProductos.length>0){
      if(this.ProveedoresControl.value != ''){
        this.ds.creaIngreso(this.database.Documentos[this.DocPushID],this.lista).then(a=>{
          este.navCtrl.pop()
        })
      }else{
        this.ds.presentAlert('Error','debes elegir un proveedor y anexar producutos')
      }
    }else{
      this.ds.presentAlert('Error','debes elegir un proveedor y anexar producutos')
    }
  }
  ngOnInit() {}

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
    for(let i in this.usuarios['proveedor']){
      this.proveedores.push(this.usuarios['proveedor'][i].nombre)
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

}