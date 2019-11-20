import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
// Mis componentes
import { ProductoComponent } from './producto/producto.component';
import { DocumentoComponent } from './documento/documento.component';

const Componentes = [
    ProductoComponent,
    DocumentoComponent
];

@NgModule({
    declarations: [Componentes],
    imports: [IonicModule,CommonModule],
    exports: [Componentes]
})

export class ComponentsModule {}