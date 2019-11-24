import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  { path: 'ingresos', loadChildren: './pages/ingresos/ingresos.module#IngresosPageModule' },
  { path: 'salidas', loadChildren: './pages/salidas/salidas.module#SalidasPageModule' },
  { path: 'movimientos', loadChildren: './pages/movimientos/movimientos.module#MovimientosPageModule' },
  { path: 'productos', loadChildren: './pages/productos/productos.module#ProductosPageModule' },
  { path: 'create-producto', loadChildren: './pages/create-producto/create-producto.module#CreateProductoPageModule' },
  { path: 'bodegas', loadChildren: './pages/bodegas/bodegas.module#BodegasPageModule' },
  { path: 'create-bodega', loadChildren: './pages/create-bodega/create-bodega.module#CreateBodegaPageModule' },
  { path: 'usuarios', loadChildren: './pages/usuarios/usuarios.module#UsuariosPageModule' },
  { path: 'create-usuarios', loadChildren: './pages/create-usuarios/create-usuarios.module#CreateUsuariosPageModule' },
  { path: 'create-ingreso', loadChildren: './pages/create-ingreso/create-ingreso.module#CreateIngresoPageModule' },
  { path: 'create-movimiento', loadChildren: './pages/create-movimiento/create-movimiento.module#CreateMovimientoPageModule' },
  { path: 'pagos', loadChildren: './pages/pagos/pagos.module#PagosPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
