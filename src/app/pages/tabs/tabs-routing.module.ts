import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'Dashboard',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../Dashboard/Dashboard.module').then(m => m.DashboardPageModule)
          }
        ]
      },
      {
        path: 'inventario',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../inventario/inventario.module').then(m => m.inventarioPageModule)
          }
        ]
      },
      {
        path: 'resumen',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../resumen/resumen.module').then(m => m.resumenPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/Dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/Dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
