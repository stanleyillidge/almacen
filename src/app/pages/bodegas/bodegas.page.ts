import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { LocalDatabase, Bodega } from 'src/app/models/data-models';
import { DataService } from 'src/app/models/data-service';

@Component({
  selector: 'app-bodegas',
  templateUrl: './bodegas.page.html',
  styleUrls: ['./bodegas.page.scss'],
})
export class BodegasPage implements OnInit {
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
    this.ds.BodegaObserver.subscribe((newData) => {
      console.log('Se actualizó una bodega',newData);
      this.database = newData;
      este.data = [];
      Object.keys(this.database.Bodegas).map(function(i){
        este.data.push(este.database.Bodegas[i]);
      });
    });
  }
  page(data:any,accion:string){
    let page = 'create-bodega'
    console.log(accion,data)
    if(data == ''){
      data = {}
      data.key = ''
    }
    this.navCtrl.navigateForward([page,{accion:accion,key:data.key}]);
  }
  ngOnInit() {
    let este = this;
    this.database = this.ds.Database;
    este.data = [];
    if(this.database.Bodegas){
      Object.keys(this.database.Bodegas).map(function(i){
        este.data.push(este.database.Bodegas[i]);
      });
    }
    console.log('ngOnInit',this.database)
  }
}
