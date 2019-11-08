import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
// Mis componentes
import { ProductoComponent } from './producto/producto.component';

const Componentes = [
    ProductoComponent
];

@NgModule({
    declarations: [Componentes],
    imports: [IonicModule,CommonModule],
    exports: [Componentes]
})

export class ComponentsModule {}