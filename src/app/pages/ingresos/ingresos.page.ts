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
  ingresos: any;
  ingresost: any;
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
      este.ingresost = [];
      este.ingresos = [];
      setTimeout(function(){
        este.actualiza(este.database)
        console.log(este.ingresos)
      }, 300);
    });
  }
  onInput(ev:any){
    // Reset items back to all of the items
    // this.initializeItems();
    // this.ingresos = this.ingresost;
    this.ingresos = this.ingresost
    // console.log(this.ingresost)
    // set val to the value of the searchbar
    const val = ev.target.value;

    if(this.ingresos){
      if (val && val.trim() != '') {
        this.ingresos = this.ingresos.filter((n) => {
          return (n.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1);
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
  page(mov:string,data:any,accion:string){
    let page = 'create-ingreso'
    console.log(accion,data)
    if(data == ''){
      data = {}
      data.key = ''
    }
    this.navCtrl.navigateForward([page,{mov:mov,accion:accion,key:data.key}]);
  }
  ngOnInit() {
    this.database = this.ds.Database;
    this.actualiza(this.database)
    console.log('ngOnInit',this.database)
  }
  actualiza(data){
    let este = this;
    este.ingresost = [];
    este.ingresos = [];
    if(data.Documentos){
      Object.keys(data.Documentos).map(function(i){
        if(data.Documentos[i].tipo == 'compra'){
          este.ingresos.unshift(data.Documentos[i]);
          este.ingresost.unshift(data.Documentos[i]);
        }
      });
    }
  }
}