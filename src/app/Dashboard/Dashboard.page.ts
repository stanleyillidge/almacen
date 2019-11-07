import { Component } from '@angular/core';
import { TabsPage } from '../tabs/tabs.page';

@Component({
  selector: 'app-Dashboard',
  templateUrl: 'Dashboard.page.html',
  styleUrls: ['Dashboard.page.scss']
})
export class DashboardPage {
  toggle:boolean = false;
  constructor(
    public tab:TabsPage
  ) {
    this.tab.toggle.subscribe((newData) => {
      this.toggle = newData
    });
  }

}
