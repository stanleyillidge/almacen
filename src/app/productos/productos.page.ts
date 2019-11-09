import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {
  data:any=[];
  toggle:boolean = false;
  constructor(
    public navCtrl: NavController
  ) {
    this.toggle = false;
  }
  blur(){
    this.toggle = false;
  }
  page(page){
    this.toggle = !this.toggle;
    if(page){
      this.navCtrl.navigateForward([page,{accion:'crear'}]);
    }
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
