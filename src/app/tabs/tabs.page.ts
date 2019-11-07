import { Component } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  public toggle_: boolean = false;
  public toggle: ReplaySubject<any> = new ReplaySubject<any>();
  constructor() {}
  blur(){
    this.toggle_ = false;
    this.toggle.next(this.toggle_)
  }
  click(){
    this.toggle_ = !this.toggle_;
    this.toggle.next(this.toggle_)
  }
}
