import { Component, OnInit, Input } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
})
export class ProductoComponent implements OnInit {

  @Input('data') data;
  
  constructor(
    public navCtrl: NavController,
    public route: ActivatedRoute,
  ) { }

  page(data){
    let page = 'create-producto'
    console.log('edita',data)
    this.navCtrl.navigateForward([page,{accion:'editar',key:data.key}]);
  }

  ngOnInit() {}

}
