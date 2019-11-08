import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {
  data:any=[];
  constructor() { }

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
