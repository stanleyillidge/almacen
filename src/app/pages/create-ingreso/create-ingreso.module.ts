import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CreateIngresoPage } from './create-ingreso.page';

import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSelectModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatRippleModule } from '@angular/material';

const routes: Routes = [
  {
    path: '',
    component: CreateIngresoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatIconModule,
    MatSelectModule
  ],
  declarations: [CreateIngresoPage]
})
export class CreateIngresoPageModule {}
