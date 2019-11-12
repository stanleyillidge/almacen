import { Component, OnInit } from '@angular/core';
import { LocalDatabase } from 'src/app/models/data-models';
import { DataService } from 'src/app/services/data-service';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  database: LocalDatabase;
  usuarios: any[];
  constructor(
    public ds:  DataService,
    public navCtrl: NavController,
    public alertController: AlertController
  ) { 
    let este = this;
    this.ds.UsuariosObserver.subscribe((newData) => {
      console.log('Se actualizó un Usuario',newData);
      this.database = newData;
      este.usuarios = [];
      Object.keys(this.database.Usuarios).map(function(i){
        este.usuarios.push(este.database.Usuarios[i]);
      });
    });
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
    let este = this;
    this.database = this.ds.Database;
    este.usuarios = [];
    if(this.database.Usuarios){
      Object.keys(this.database.Usuarios).map(function(i){
        este.usuarios.push(este.database.Usuarios[i]);
      });
    }
    console.log('ngOnInit',this.database)
  }
}