import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../models/data-service';
import { LocalDatabase } from '../models/data-models';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {
  data:any=[];
  toggle:boolean = false;
  database: LocalDatabase;
  constructor(
    public ds:  DataService,
    public navCtrl: NavController,
    public alertController: AlertController
  ) {
    let este = this;
    this.toggle = false;
    this.ds.ProductoObserver.subscribe((newData) => {
      // console.log('Se actualizaron las sedes',newData);
      this.database = newData;
      este.data = [];
      Object.keys(this.database.Productos).map(function(i){
        este.data.push(este.database.Productos[i]);
      });
    });
  }
  page(page){
    // this.toggle = !this.toggle;
    if(page){
      this.navCtrl.navigateForward([page,{accion:'crear'}]);
    }
  }
  ngOnInit() {
    let este = this;
    this.database = this.ds.Database;
    este.data = [];
    Object.keys(this.database.Productos).map(function(i){
      este.data.push(este.database.Productos[i]);
    });
    console.log('ngOnInit',this.database)
    /* for(let i = 1;i<40;i++){
      this.data.push({
        nombre: 'Cerveza corona 355ml '+i,
        tipo: 'Cerveza',
        precio: '$'+(100000*i)
      })
    } */
  }
}
