import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalDatabase } from 'src/app/models/data-models';
import { DataService } from 'src/app/services/data-service';
import { NavController, AlertController, IonSearchbar } from '@ionic/angular';

@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.page.html',
  styleUrls: ['./ingresos.page.scss'],
})
export class IngresosPage implements OnInit {
  @ViewChild('autofocus', { static: false }) searchbar: IonSearchbar;
  database: LocalDatabase;
  inventarios: any;
  inventariost: any;
  searchTest: boolean = false;
  constructor(
    public ds:  DataService,
    public navCtrl: NavController,
    public alertController: AlertController
  ) { 
    let este = this;
    this.ds.InventarioObserver.subscribe((newData) => {
      console.log('Se actualizó un inventario',newData);
      this.database = newData;
      this.actualiza(this.database)
      console.log(this.inventarios)
    });
  }
  onInput(ev:any){
    // Reset items back to all of the items
    // this.initializeItems();
    // this.inventarios = this.inventariost;
    this.inventarios['admin'] = this.inventariost['admin']
    this.inventarios['proveedor'] = this.inventariost['proveedor']
    this.inventarios['empleado'] = this.inventariost['empleado']
    this.inventarios['cliente'] = this.inventariost['cliente']
    // console.log(this.inventariost)
    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if(this.inventarios['admin']){
      if (val && val.trim() != '') {
        this.inventarios['admin'] = this.inventarios['admin'].filter((u) => {
          return (u.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1) || (u.cedula.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }
    if(this.inventarios['proveedor']){
      if (val && val.trim() != '') {
        this.inventarios['proveedor'] = this.inventarios['proveedor'].filter((a) => {
          return (a.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1) || (a.cedula.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }
    if(this.inventarios['empleado']){
      if (val && val.trim() != '') {
        this.inventarios['empleado'] = this.inventarios['empleado'].filter((m) => {
          return (m.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1) || (m.cedula.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }
    if(this.inventarios['cliente']){
      if (val && val.trim() != '') {
        this.inventarios['cliente'] = this.inventarios['cliente'].filter((n) => {
          return (n.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1) || (n.cedula.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }
  }
  public click(): void {
    this.searchTest = !this.searchTest;
    setTimeout(() => {
      this.searchbar.setFocus()
    }, 150);
  }
  public onBlur(ev:any): void {
    this.searchTest = !this.searchTest;
  }
  page(data:any,accion:string){
    let page = 'create-ingreso'
    console.log(accion,data)
    if(data == ''){
      data = {}
      data.key = ''
    }
    this.navCtrl.navigateForward([page,{accion:accion,key:data.key}]);
  }
  ngOnInit() {
    this.database = this.ds.Database;
    this.actualiza(this.database)
    console.log('ngOnInit',this.database)
  }
  actualiza(data){
    let este = this;
    este.inventariost = {};
    este.inventarios = {};
    if(data.inventarios){
      Object.keys(data.inventarios).map(function(i){
        if(!este.inventarios[data.inventarios[i].rol]){
          este.inventarios[data.inventarios[i].rol]=[];
          este.inventariost[data.inventarios[i].rol]=[];
        }
        este.inventarios[data.inventarios[i].rol].push(data.inventarios[i]);
        este.inventariost[data.inventarios[i].rol].push(data.inventarios[i]);
      });
    }
  }
}