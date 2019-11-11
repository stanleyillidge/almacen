import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { resumenPage } from './resumen.page';

describe('resumenPage', () => {
  let component: resumenPage;
  let fixture: ComponentFixture<resumenPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [resumenPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(resumenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
