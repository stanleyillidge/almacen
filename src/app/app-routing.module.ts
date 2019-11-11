import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  { path: 'entradas', loadChildren: './pages/entradas/entradas.module#EntradasPageModule' },
  { path: 'salidas', loadChildren: './pages/salidas/salidas.module#SalidasPageModule' },
  { path: 'movimientos', loadChildren: './pages/movimientos/movimientos.module#MovimientosPageModule' },
  { path: 'productos', loadChildren: './pages/productos/productos.module#ProductosPageModule' },
  { path: 'create-producto', loadChildren: './pages/create-producto/create-producto.module#CreateProductoPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
