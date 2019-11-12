import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { LocalDatabase } from 'src/app/models/data-models';
import { DataService } from 'src/app/services/data-service';

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
      console.log('Se actualizo un producto',newData);
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
  }
}
