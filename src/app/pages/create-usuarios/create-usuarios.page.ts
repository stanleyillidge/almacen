import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data-service';
import { Usuario } from 'src/app/models/data-models';


@Component({
  selector: 'app-create-usuarios',
  templateUrl: './create-usuarios.page.html',
  styleUrls: ['./create-usuarios.page.scss'],
})
export class CreateUsuariosPage implements OnInit {
  newUsuarioForm: FormGroup;
  accion:string;
  key: string;
  usuario: any;
  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    public route: ActivatedRoute,
    public ds:  DataService
  ) {
    this.accion = this.route.snapshot.paramMap.get('accion');
    if(this.accion =='crear'){
      this.creaFormularioVacio()
    }else{
      this.key = this.route.snapshot.paramMap.get('key');
      this.usuario = this.ds.Database.Usuarios[this.key];
      console.log(this.usuario)
      this.creaFormulario(this.usuario)
    }
  }
  creaFormulario(data){
    //-------------------
      this.newUsuarioForm = this.fb.group({
        nombre: new FormControl(data.nombre, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        rol: new FormControl(data.rol, Validators.compose([Validators.required])),
        direccion: new FormControl(data.direccion, Validators.compose([Validators.required])),
        barrio: new FormControl(data.barrio, Validators.compose([Validators.required])),
        cedula: new FormControl(data.cedula, Validators.compose([Validators.required])),
        telefono: new FormControl(data.telefono, Validators.compose([Validators.required])),
        email: new FormControl(data.email, Validators.compose([Validators.required])),
      });
    //-------------------
  }
  creaFormularioVacio(){
    let data = new Usuario
    data.nombre = '';
    data.rol = 'empleado'
    data.direccion = '';
    data.barrio = '';
    data.cedula = '';
    data.telefono = 0;
    data.email = '';
    this.creaFormulario(data);
  }
  creaUsuario(){
    let este = this;
    this.usuario = this.newUsuarioForm.value;
    this.usuario['uid'] = this.key;
    this.usuario.key = this.key;
    this.ds.CloudFunctionUsuarios(this.usuario,this.accion).then(()=>{
      este.navCtrl.pop()
    })
  }
  ngOnInit() {
  }

}