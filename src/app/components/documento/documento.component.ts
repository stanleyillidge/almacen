import { Component, OnInit, Input } from '@angular/core';
import { DataService } from 'src/app/services/data-service';
import { LocalDatabase } from 'src/app/models/data-models';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'documento',
  templateUrl: './documento.component.html',
  styleUrls: ['./documento.component.scss'],
})
export class DocumentoComponent implements OnInit {

  @Input('data') data;
  icono: string;
  valor: number;
  fecha: {};
  database: LocalDatabase;
  nombre: any;
  estado: string;

  constructor(
    public navCtrl: NavController,
    public ds:  DataService
  ) { }

  ngOnInit() {
    this.database = this.ds.Database
    let d = new Date(this.data.creacion);
    const dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Sept", "Octubre", "Nov", "Dec"];
    this.fecha = {}
    this.fecha['ds'] = dias[d.getDay()];
    this.fecha['d'] = d.getDate();
    this.fecha['m'] = meses[d.getMonth()];
    this.fecha['a'] = d.getFullYear();
    this.fecha['f'] = new Date(this.data.creacion).toDateString();
    if(this.data.tipo == 'compra'){
      this.nombre = this.ds.capitalize(this.ds.Database.Usuarios[this.data.proveedor].nombre)
    }else if(this.data.tipo == 'venta'){
      this.nombre = this.ds.capitalize(this.ds.Database.Usuarios[this.data.comprador].nombre)
    }
    this.estado = this.ds.capitalize(this.data.estado);
    switch (this.data.tipo) {
      case 'compra':
        this.icono = 'archive'
        break;
      case 'venta':
        this.icono = 'unarchive'
        break;
      case 'traslado':
        this.icono = 'archive'
        break;
      case 'notaDebito':
        this.icono = 'archive'
        break;
      case 'notaCredito':
        this.icono = 'archive'
        break;
    
      default:
        break;
    }
  }
  page(data){
    let page = 'create-ingreso'
    console.log('edita',data)
    this.navCtrl.navigateForward([page,{accion:'editar',key:data.key}]);
  }
}
