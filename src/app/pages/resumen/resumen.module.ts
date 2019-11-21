import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { resumenPage } from './resumen.page';
import { MatAutocompleteModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatRippleModule, MatIconModule, MatSelectModule } from '@angular/material';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: resumenPage }]),
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatIconModule,
    MatSelectModule
  ],
  declarations: [resumenPage]
})
export class resumenPageModule {}
