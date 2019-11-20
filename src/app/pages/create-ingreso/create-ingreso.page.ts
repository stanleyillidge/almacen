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
  
  newIngresoForm: FormGroup;
  accion:string;
  key: string;
  usuariost: {};
  usuarios: {};
  database: LocalDatabase;
  listaProductos:any;
  total: any;
  DocPushID: string;
  lista: {};
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
      console.log(this.ds.Database.Documentos[this.key])
      this.creaFormulario(this.ds.Database.Documentos[this.key])
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
        costo: new FormControl(data.costo, Validators.compose([Validators.required]))
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
    data['costo'] = 0;
    this.creaFormulario(data);
  }
  addProducto(){
    const nombre = this.ProductoControl.value
    const proveedor = this.getKeyByValue(this.usuarios['proveedor'], this.ProveedoresControl.value,'nombre');
    this.database.Documentos[this.DocPushID].proveedor = proveedor;
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
        this.CantidadControl.setValue(0);
        this.costoControl.setValue(0);
        console.log(this.database)
      }
    }
  }
  creaDocumento(){
    let este = this
    // console.log(this.database)
    this.ds.creaIngreso(this.database.Documentos[this.DocPushID],this.lista).then(a=>{
      este.navCtrl.pop()
    })
  }
  ngOnInit() {
    this.total = {};
    this.lista = {};
    this.total['costo'] = 0;
    this.total['unid'] = 0;
    this.listaProductos = [];
    this.database = this.ds.Database
    this.DocPushID = firebase.database().ref().push().key;
    if(!this.database.Documentos){
      this.database.Documentos = {};
    }
    this.database.Documentos[this.DocPushID] = new Documento;
    this.database.Documentos[this.DocPushID].key = this.DocPushID;
    this.database.Documentos[this.DocPushID].creacion = new Date();
    this.database.Documentos[this.DocPushID].tipo = 'ingreso';
    this.database.Documentos[this.DocPushID].estado = 'pendiente';
    this.database.Documentos[this.DocPushID].numProductos = 0;
    this.database.Documentos[this.DocPushID].valor = 0;
    this.database.Documentos[this.DocPushID].comprador = 'su empresa';
    this.database.Documentos[this.DocPushID].usuario = 'usuario autenticado en la app'
    this.actualiza(this.database)
    for(let i in this.usuarios['proveedor']){
      this.proveedores.push(this.usuarios['proveedor'][i].nombre)
    }
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
  }
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