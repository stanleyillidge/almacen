import { Component } from '@angular/core';
import { TabsPage } from '../tabs/tabs.page';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  toggle:boolean = false;
  constructor(
    public tab:TabsPage
  ) {
    this.tab.toggle.subscribe((newData) => {
      this.toggle = newData
    });
  }

}
