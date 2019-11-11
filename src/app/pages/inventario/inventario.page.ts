import { Component } from '@angular/core';
import { TabsPage } from '../tabs/tabs.page';

@Component({
  selector: 'app-inventario',
  templateUrl: 'inventario.page.html',
  styleUrls: ['inventario.page.scss']
})
export class inventarioPage {
  toggle:boolean = false;
  constructor(
    public tab:TabsPage
  ) {
    this.toggle = false;
    this.tab.toggle.subscribe((newData) => {
      this.toggle = newData
    });
  }

}