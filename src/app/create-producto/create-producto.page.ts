import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../models/data-service';

@Component({
  selector: 'app-create-producto',
  templateUrl: './create-producto.page.html',
  styleUrls: ['./create-producto.page.scss'],
})
export class CreateProductoPage implements OnInit {
  newProductoForm: FormGroup;
  accion:string;
  Path: any = "/assets/shapes.svg";
  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    public route: ActivatedRoute,
    public ds:  DataService
  ) {
    this.accion = this.route.snapshot.paramMap.get('accion');
    if(this.accion =='crear'){
      this.creaFormularioVacio()
    }
  }
  creaFormulario(data){
    //-------------------
      this.newProductoForm = this.fb.group({
        nombre: new FormControl(data.nombre, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        tipo: new FormControl(data.tipo, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        precio: new FormControl(data.precio, Validators.compose([
          Validators.required,
          Validators.maxLength(7),
          Validators.minLength(1),
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ]))
      });
    //-------------------
  }
  creaFormularioVacio(){
    let data = []
    data['nombre'] = ''
    data['tipo'] = ''
    data['precio'] = 0
    this.creaFormulario(data);
  }
  ngOnInit() {
  }

}
