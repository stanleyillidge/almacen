import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data-service';
import { Documento, LocalDatabase } from 'src/app/models/data-models';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';

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
  
  newIngresoForm: FormGroup;
  accion:string;
  key: string;
  ingreso: any;
  usuariost: {};
  usuarios: {};
  database: LocalDatabase;
  listaProductos:any;
  total: any;
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
  addProducto(){
    const nombre = this.ProductoControl.value
    const cantidades = this.CantidadControl.value
    let data = {}
    for(let i in this.database.Productos){
      if(this.database.Productos[i].nombre == nombre){
        data = this.database.Productos[i];
        this.total['precio'] += (Number(this.database.Productos[i].precio) * Number(cantidades))
        this.total['unid'] += Number(cantidades); 
        data['cantitades'] = Number(cantidades);
        this.listaProductos.unshift(data);
        this.ProductoControl.setValue('');
        this.CantidadControl.setValue('');
        console.log(this.listaProductos)
      }
    }
  }
  creaDocumento(){
    let este = this;
    this.ingreso = this.newIngresoForm.value;
    this.ingreso['uid'] = this.key;
    this.ingreso.key = this.key;
    console.log(this.ProveedoresControl)
    // this.ds.CloudFunctionDocumentos(this.ingreso,this.accion).then(()=>{
    //   este.navCtrl.pop()
    // })
  }
  ngOnInit() {
    this.total = {};
    this.total['precio'] = 0;
    this.total['unid'] = 0;
    this.listaProductos = [];
    this.database = this.ds.Database
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
  private _filterProveedores(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.proveedores.filter(option => option.toLowerCase().includes(filterValue));
  }
  private _filterProductos(values: string): string[] {
    const filterValues = values.toLowerCase();
    return this.productos.filter(options => options.toLowerCase().includes(filterValues));
  }

}