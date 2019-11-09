import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  { path: 'entradas', loadChildren: './entradas/entradas.module#EntradasPageModule' },
  { path: 'salidas', loadChildren: './salidas/salidas.module#SalidasPageModule' },
  { path: 'movimientos', loadChildren: './movimientos/movimientos.module#MovimientosPageModule' },
  { path: 'productos', loadChildren: './productos/productos.module#ProductosPageModule' },
  { path: 'create-producto', loadChildren: './create-producto/create-producto.module#CreateProductoPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
