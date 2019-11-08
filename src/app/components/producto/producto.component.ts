import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
})
export class ProductoComponent implements OnInit {

  @Input('precio') precio;
  @Input('tipo') tipo;
  @Input('nombre') nombre;
  
  constructor() { }

  ngOnInit() {}

}
