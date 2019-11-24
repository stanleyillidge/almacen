import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data-service';
import { Pago, LocalDatabase } from 'src/app/models/data-models';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
})
export class PagosPage implements OnInit {

  key: string;
  pagosArray:any;
  database: LocalDatabase;

  constructor(
    public navCtrl: NavController,
    public alertController: AlertController,
    public route: ActivatedRoute,
    public ds:  DataService
  ) { 
    this.key = this.route.snapshot.paramMap.get('key');
    this.pagosArray = [];
    this.ds.InventarioObserver.subscribe((newData) => {
      console.log('Se actualizó un inventario',newData);
      this.database = newData;
      this.actualiza(this.database)
      console.log(this.pagosArray)
    });
  }

  ngOnInit() {
    this.database = this.ds.Database;
    this.actualiza(this.database)
    console.log('ngOnInit',this.database)
  }
  actualiza(data:LocalDatabase){
    let este = this;
    este.pagosArray = [];
    if(data.Pagos){
      Object.keys(data.Pagos).map(function(i){
        if(data.Pagos[i].documento == este.key){
          este.pagosArray.unshift(data.Pagos[i]);
        }
      });
    }
  }
  async pagos(){
    let data = new Pago()
    const alert = await this.alertController.create({
      header: 'Abono',
      inputs: [
        {
          name: 'abono',
          type: 'number',
          placeholder: 'Valor'
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
          handler:async (d) => {
            let este = this;
            let abono = Number(d.abono);
            if(isNaN(abono)){
              abono = 0
            }
            console.log('abono:',abono)
            if(d.abono!=''){
              data = {
                key: '',
                fecha: new Date(),
                documento: this.key,
                valor: 0,
                abono: d.abono,
                usuario: 'empleado autenticado'
              }
              this.ds.pagos(data)
              return
            }else{
              let mensaje = 'Debe digitar un valor para realizar el proceso de pago'
              this.ds.presentAlert('Error',mensaje);
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
