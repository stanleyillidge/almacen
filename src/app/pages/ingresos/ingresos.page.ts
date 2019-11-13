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
  usuarios: any;
  usuariost: any;
  searchTest: boolean = false;
  constructor(
    public ds:  DataService,
    public navCtrl: NavController,
    public alertController: AlertController
  ) { 
    let este = this;
    this.ds.UsuariosObserver.subscribe((newData) => {
      console.log('Se actualizó un Usuario',newData);
      this.database = newData;
      this.actualiza(this.database)
      console.log(this.usuarios)
    });
  }
  onInput(ev:any){
    // Reset items back to all of the items
    // this.initializeItems();
    // this.usuarios = this.usuariost;
    this.usuarios['admin'] = this.usuariost['admin']
    this.usuarios['proveedor'] = this.usuariost['proveedor']
    this.usuarios['empleado'] = this.usuariost['empleado']
    this.usuarios['cliente'] = this.usuariost['cliente']
    // console.log(this.usuariost)
    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if(this.usuarios['admin']){
      if (val && val.trim() != '') {
        this.usuarios['admin'] = this.usuarios['admin'].filter((u) => {
          return (u.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1) || (u.cedula.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }
    if(this.usuarios['proveedor']){
      if (val && val.trim() != '') {
        this.usuarios['proveedor'] = this.usuarios['proveedor'].filter((a) => {
          return (a.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1) || (a.cedula.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }
    if(this.usuarios['empleado']){
      if (val && val.trim() != '') {
        this.usuarios['empleado'] = this.usuarios['empleado'].filter((m) => {
          return (m.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1) || (m.cedula.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }
    if(this.usuarios['cliente']){
      if (val && val.trim() != '') {
        this.usuarios['cliente'] = this.usuarios['cliente'].filter((n) => {
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
    let page = 'create-usuarios'
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
    este.usuariost = {};
    este.usuarios = {};
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
}