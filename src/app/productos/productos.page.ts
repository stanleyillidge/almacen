import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {
  data:any=[];
  toggle:boolean = false;
  constructor(
    public navCtrl: NavController,
    public alertController: AlertController
  ) {
    this.toggle = false;
  }
  page(page){
    // this.toggle = !this.toggle;
    if(page){
      this.navCtrl.navigateForward([page,{accion:'crear'}]);
    }
  }
  async creaTipo() {
    const alert = await this.alertController.create({
      header: 'Crear tipo de producto',
      inputs: [
        {
          name: 'tipo',
          type: 'text',
          placeholder: 'Tipo de producto'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.toggle = !this.toggle;
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.toggle = !this.toggle;
            console.log('Confirm Ok',data);
          }
        }
      ]
    });

    await alert.present();
  }
  ngOnInit() {
    for(let i = 1;i<40;i++){
      this.data.push({
        nombre: 'Cerveza corona 355ml '+i,
        tipo: 'Cerveza',
        precio: '$'+(100000*i)
      })
    }
  }
}
