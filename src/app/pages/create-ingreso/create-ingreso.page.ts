import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data-service';
import { Documento, LocalDatabase, ListaDetallada, Bodega, Inventario } from 'src/app/models/data-models';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import * as firebase from 'firebase/app';
import 'firebase/database';//eider 2
import { isNull, isUndefined } from 'util';

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
  productos: any = {};
  filteredProductos: Observable<string[]>;

  BodegasControl = new FormControl();
  bodegas: any = {};
  filteredBodegas: Observable<string[]>;

  CantidadControl = new FormControl();
  costoControl = new FormControl();
  estadoControl = new FormControl();
  descuentoControl = new FormControl(0, [Validators.max(100), Validators.min(0)]);
  
  newIngresoForm: FormGroup;
  accion:string;
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
  descMax: number = 0;
  UnidxEspacioDisp: any = {};
  inventario: { [key: string]: Inventario };
  
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

    this.productos['array'] = [];
    this.productos['obj'] = {};
    this.bodegas['array'] = [];
    this.bodegas['obj'] = {};

    this.documento = {};
    this.total['costo'] = 0;
    this.total['unid'] = 0;
    this.total['pendiente'] = 0;
    this.total['estado'] = '';
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
      if(this.mov == 'compra'){this.descuentoControl.disable();}
      this.creaFormularioVacio()
    }else{      
      this.DocPushID = this.route.snapshot.paramMap.get('key');
      console.log(this.DocPushID)
      this.creaFormulario(this.database.Documentos[this.DocPushID])
    }
    
    this.ds.InventarioObserver.subscribe((newData) => {
      console.log('Se actualizó un inventario',newData);
      if(this.route.snapshot.paramMap.get('key')){
        this.DocPushID = this.route.snapshot.paramMap.get('key');
        this.database = newData;
        this.actualiza(this.database)
        this.creaFormulario(this.database.Documentos[this.DocPushID])
      }
    });
  }
  cantidadChange(cantidad:number){
    let este = this
    if(this.mov == 'compra'){
      // console.log('cantidad event',e)
      if(this.ProductoControl.value != ''){
        const prodkey = this.productos.obj[this.ProductoControl.value];
        this.calculaEspacioBodegas(prodkey,cantidad)//e.target.value)
      }
    } else if(this.mov == 'venta'){
      este.bodegas.obj={};
      este.bodegas.array = [];
      let test = false;
      const prod = this.getKeyByValue(this.database.Productos, this.ProductoControl.value,'nombre');
      let mensaje = 'Ninguna bodega tiene disponibilidad para '+cantidad+' unidad(es) de producto'
      Object.entries(this.inventario).filter(
      ([key,inv])=>inv.cantidad>=cantidad && inv.producto == prod).forEach(
        ([key,inv])=>{
          este.bodegas.array.push(este.database.Bodegas[inv.bodega].nombre)
          let modelo = new Bodega();
          este.bodegas.obj[inv.bodega] = este.ds.iteraModelo(modelo,este.database.Bodegas[inv.bodega])
          test = true
        })
      this.filteredBodegas = this.BodegasControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterBodegas(value))
      );
      if(!test){
        this.CantidadControl.setValue('');
        Object.entries(this.inventario).filter(
          ([key,inv])=>inv.producto == prod).forEach(
            ([key,inv])=>{
              mensaje += ', Hay <strong>'+inv.cantidad+'</strong> en la bodega: '+este.database.Bodegas[inv.bodega].nombre+'\n'
            })

        this.ds.presentAlert('Alerta',mensaje);
      }
      console.log(este.inventario,este.bodegas.obj)
    }
  }
  calculaEspacioBodegas(prodkey:string,cantidad:number){
    let este = this
    let test = {}
    test['t'] = false
    test['key'] = '';
    const titulo = 'Alerta';
    let mensaje = 'Ninguna bodega tiene capacidad para toda la mercancia';
    const volumen = this.database.Productos[prodkey].Tamaño * cantidad
    this.bodegas.array = [];
    Object.keys(este.bodegas.obj).map(function(i){
      let espDisp = (este.bodegas.obj[i].espacioDisponible*0.85);
      // ojo estas son las unidades de producto que caben en el volumen disponible en bodega
      este.UnidxEspacioDisp[i] = Math.trunc(espDisp / este.database.Productos[prodkey].Tamaño);
      console.log('Consulta bodega',este.bodegas.obj[i].nombre, espDisp, volumen)
      if( espDisp >= volumen){
        este.bodegas.array.push(este.bodegas.obj[i].nombre)
        test['t'] = true;
        test['key'] = i;
      }else{
        mensaje = mensaje + ', la bodega ' + este.bodegas.obj[i].nombre + ' puede recibir ' + este.UnidxEspacioDisp[i]
      }
    });
    if(!test['t']){
      this.CantidadControl.setValue('')
      this.ds.presentAlert(titulo,mensaje)
    }
    this.filteredBodegas = this.BodegasControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterBodegas(value))
      );
      return test
  }
  productosChange(e){
    if(this.mov == 'venta' && e.source.selected){
      console.log(e)
      const key = this.productos.obj[e.source.value];
      this.costoControl.enable();
      this.descuentoControl.enable();
      this.descMax = this.database.Productos[key].descuento;
      if(this.descMax == 0){
        this.descuentoControl.disable();
      }else{
        this.descuentoControl.enable();
        this.descuentoControl = new FormControl(0, [Validators.max(this.descMax), Validators.min(0)]);
      }
      this.costoControl.setValue(this.database.Productos[key].precio);
      this.costoControl.disable();
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
    this.total['unid'] = 0;
    this.listaProductos = [];
    this.disabled = true;
    this.disabledfab = true;
    // this.DocPushID = data.key; // error
    let proveedor
    this.ProductoControl = new FormControl({value: '', disabled: true});
    this.CantidadControl = new FormControl({value: '', disabled: true});
    this.costoControl = new FormControl({value: '', disabled: true});
    this.BodegasControl = new FormControl({value: '', disabled: true});
    this.estadoControl.setValue(data.estado);
    this.estadoControl.disable();
    if((this.accion == 'editar')){
      this.estadoControl.enable();
    }
    if(this.mov == 'compra'){
      proveedor = this.database.Usuarios[data.proveedor].nombre
    }else{
      proveedor = this.database.Usuarios[data.comprador].nombre
    }
    this.ProveedoresControl = new FormControl({value: proveedor, disabled: true});
    this.total['costo'] = data.valor;
    this.total['estado'] = data.estado;
    if(data.estado == 'pendiente'){
      this.total['costo'] = data.abonos;
      this.total['pendiente'] = data.valor - data.abonos;
    }
    for(let i in this.database.Listas){
      if(this.database.Listas[i].documento == data.key){
        this.listaProductos.unshift(this.database.Listas[i]);
        this.total['unid'] += this.database.Listas[i].cantidad;
      }
    }
  }
  abono(){
    let page = 'pagos'
    this.navCtrl.navigateForward([page,{key:this.DocPushID}]);
  }
  creaFormularioVacio(){
    this.DocPushID = firebase.database().ref().push().key;
    this.documento[this.DocPushID] = new Documento;
    this.documento[this.DocPushID].key = this.DocPushID;
    this.documento[this.DocPushID].creacion = new Date();
    this.documento[this.DocPushID].tipo = this.mov;
    this.documento[this.DocPushID].estado = 'pendiente';
    this.documento[this.DocPushID].numProductos = 0;
    this.documento[this.DocPushID].valor = 0;
    this.documento[this.DocPushID].abonos = 0;
    this.documento[this.DocPushID].comprador = 'su empresa';
    this.documento[this.DocPushID].usuario = 'usuario autenticado en la app'
    console.log('creo formulario vacio',this.documento)
  }
  addProducto_old(){
    let comprador = this.getKeyByValue(this.usuarios[this.TipoUsuario], this.ProveedoresControl.value,'nombre');
    let proveedor = 'su empresa'
    if(this.mov == 'compra'){
      comprador = 'su empresa'
      proveedor = this.getKeyByValue(this.usuarios[this.TipoUsuario], this.ProveedoresControl.value,'nombre');
    }
    if(!this.disabled){
      /*if(!this.documento[this.DocPushID]){
        this.documento[this.DocPushID] = new Documento;
        this.documento[this.DocPushID].key = this.DocPushID;
        this.documento[this.DocPushID].creacion = new Date();
        this.documento[this.DocPushID].tipo = this.mov;
        this.documento[this.DocPushID].estado = 'pendiente';
        this.documento[this.DocPushID].numProductos = 0;
        this.documento[this.DocPushID].valor = 0;
        this.documento[this.DocPushID].abonos = 0;
        this.documento[this.DocPushID].comprador = 'su empresa';
        this.documento[this.DocPushID].usuario = 'usuario autenticado en la app'
      }*/
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
          this.total['costo'] += (Number(costo) *(1 - (Number(this.descuentoControl.value)/100))* Number(cantidades))
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
          this.lista[key].descuento = Number(this.descuentoControl.value)/100;
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
      // this.DocPushID = this.key;
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
          this.total['costo'] += (Number(costo) *(1 - (Number(this.descuentoControl.value)/100))* Number(cantidades))
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
          this.lista[key].descuento = Number(this.descuentoControl.value)/100;
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
  addProducto(){
    let este = this;
    let comprador
    let proveedor
    switch (this.mov) {
      case 'compra':
        comprador = 'su empresa'
        proveedor = this.getKeyByValue(this.usuarios[this.TipoUsuario], this.ProveedoresControl.value,'nombre');
        break;
      case 'venta':
        comprador = this.getKeyByValue(this.usuarios[this.TipoUsuario], this.ProveedoresControl.value,'nombre');
        proveedor = 'su empresa'
        break;
      default:
        break;
    }
    console.log('Documento a modificar',this.DocPushID,this.documento)
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
        this.total['costo'] += (Number(costo) *(1 - (Number(this.descuentoControl.value)/100))* Number(cantidades))
        this.total['unid'] += Number(cantidades);
        this.documento[this.DocPushID].valor = this.total['costo'];
        this.documento[this.DocPushID].numProductos = this.total['unid'];
        this.lista[key].key = key;
        this.lista[key].estado = this.estadoControl.value;
        this.lista[key].tipo = this.documento[this.DocPushID].tipo;
        this.lista[key].creacion = this.documento[this.DocPushID].creacion;
        this.lista[key].bodega =  this.getKeyByValue(this.database.Bodegas, this.BodegasControl.value,'nombre');
        this.lista[key].documento = this.DocPushID;
        this.lista[key].proveedor = proveedor
        this.lista[key].comprador = comprador
        this.lista[key].usuario = 'usuario autenticado en la app'
        this.lista[key].producto = this.database.Productos[i].key;
        if (this.mov =='compra') {
          this.lista[key].costo = Number(costo); 
        }else if (this.mov =='venta'){
          this.lista[key].precio = this.database.Productos[i].precio; 
        }
        this.lista[key].descuento = Number(this.descuentoControl.value)/100;
        this.lista[key].cantidad = Number(cantidades);
        this.lista[key]['nombre'] = this.database.Productos[i].nombre;

        const VolumenOcupado = this.lista[key].Ocupacion(this.database);
        switch (this.mov) {
          case 'compra':
            const testB = this.calculaEspacioBodegas(this.lista[key].producto,this.lista[key].cantidad)
            console.log(testB,this.bodegas.obj[this.lista[key].bodega].espacioDisponible,VolumenOcupado)
            if(testB['t']){
              // si no hay espacio en la bodega seleccionada, asigna en la inmediatamenete siguiente con capacidad
              console.log('Bodega con espacio',this.bodegas.obj[testB['key']])
              if(this.lista[key].bodega != testB['key']){
                const mensaje = 'La bodega '+this.bodegas.obj[this.lista[key].bodega].nombre+
                ' no tiene capacidad, le fue asignada la bodega '+this.bodegas.obj[testB['key']].nombre
                this.ds.presentAlert('Alerta',mensaje)
              }
              this.bodegas.obj[testB['key']].espacioDisponible -= Number(VolumenOcupado);
            }else{
              const mensaje = 'Ninguna bodega tiene capacidad para almacenar el pedido'
              this.ds.presentAlert('Alerta',mensaje)
              return
            }
            break;
          case 'venta':
            this.bodegas.obj[this.lista[key].bodega].espacioDisponible += VolumenOcupado;
            Object.entries(this.inventario).filter(
              ([keyx,inv])=>inv.bodega>=this.lista[key].bodega && inv.producto == this.lista[key].producto).forEach(
                ([keyx,inv])=>{
                  this.inventario[keyx].cantidad -= this.lista[key].cantidad;
                  if(this.inventario[keyx].cantidad == 0){
                    delete this.inventario[keyx]
                    este.productos.array = []
                    este.productos.obj = {}
                    Object.entries(este.inventario).map(([key,inv]) => inv.producto)
                    .filter((value, index, self) => self.indexOf(value) === index).forEach(
                      (inv)=>{
                        este.productos.array.push(este.database.Productos[inv].nombre)
                        este.productos.obj[este.database.Productos[inv].nombre] = inv;
                      })
                  }
                })
            break;
          default:
            break;
        }
        this.listaProductos.unshift(this.lista[key]);
        this.ProductoControl.setValue('');
        this.CantidadControl.setValue('');
        this.costoControl.setValue('');
        this.BodegasControl.setValue('');
        this.descuentoControl.setValue(0);
        console.log(this.documento, this.lista)
      }
    }
  }
  async creaDocumento(){
    let este = this
    console.log(this.accion,this.estadoControl.value,this.ProveedoresControl.value,this.listaProductos.length)
    if(this.accion == 'crear'){
      if(this.listaProductos.length>0){
        if(this.ProveedoresControl.value != '' && !isNull(this.ProveedoresControl.value) && !isUndefined(this.ProveedoresControl.value)){
  
          let comprador = this.getKeyByValue(this.usuarios[this.TipoUsuario], this.ProveedoresControl.value,'nombre');
          let proveedor = 'su empresa'
          if(this.mov == 'compra'){
            comprador = 'su empresa'
            proveedor = this.getKeyByValue(this.usuarios[this.TipoUsuario], this.ProveedoresControl.value,'nombre');
          }
          this.documento[this.DocPushID].proveedor = proveedor;
          this.documento[this.DocPushID].comprador = comprador;
          this.documento[this.DocPushID].estado = this.estadoControl.value;
          this.documento[this.DocPushID].creacion = new Date();
  
          this.ds.creaIngreso(this.documento[this.DocPushID],this.lista).then(a=>{
            este.navCtrl.pop()
          })
        }else{
          let mensaje = 'Debes elegir un cliente y anexar producutos'
          if(this.mov == 'compra'){
            mensaje = 'Debes elegir un proveedor y anexar producutos'
          }
          this.ds.presentAlert('Error',mensaje)
        }
      }else{
        let mensaje = 'Debes elegir un cliente y anexar producutos'
        if(this.mov == 'compra'){
          mensaje = 'Debes elegir un proveedor y anexar producutos'
        }
        this.ds.presentAlert('Error',mensaje)
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
              console.log('Documento a ser anulado',this.DocPushID,this.documento);
              this.ds.actualizaDoc(this.documento[this.DocPushID]).then(a=>{
                este.navCtrl.pop()
              })
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
  actualiza(data:LocalDatabase){
    let este = this;
    este.usuariost = {};
    este.usuarios = {};
    if(data.Productos){
      if(este.mov == 'compra'){
        Object.keys(data.Productos).map(function(i){
          este.productos.array.push(data.Productos[i].nombre)
          este.productos.obj[data.Productos[i].nombre] = i;
        });
      }else if(este.mov == 'venta'){
        Object.entries(data.Inventario).map(([key,inv]) => inv.producto)
        .filter((value, index, self) => self.indexOf(value) === index).forEach(
          (inv)=>{
            este.productos.array.push(data.Productos[inv].nombre)
            este.productos.obj[data.Productos[inv].nombre] = inv;
          })
      }
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
        este.bodegas.array.push(data.Bodegas[i].nombre)
        este.bodegas.obj[data.Bodegas[i].nombre] = data.Bodegas[i];
        let modelo = new Bodega();
        este.bodegas.obj[i] = este.ds.iteraModelo(modelo,data.Bodegas[i])

      });
    }
    for(let i in this.usuarios[this.TipoUsuario]){
      let modelo = new Bodega();
      this.proveedores.push(this.usuarios[this.TipoUsuario][i].nombre)
    }
    this.inventario = {};
    for(let i in data.Inventario){
      let modelo = new Inventario();
      this.inventario[i] = este.ds.iteraModelo(modelo,data.Inventario[i])
    }
    // console.log('Actu',this.inventario)
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
    return this.productos.array.filter(options => options.toLowerCase().includes(filterValues));
  }
  private _filterBodegas(values: string): string[] {
    const filterValues = values.toLowerCase();
    return this.bodegas.array.filter(options => options.toLowerCase().includes(filterValues));
  }
}