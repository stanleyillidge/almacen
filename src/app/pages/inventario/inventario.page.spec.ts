import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { inventarioPage } from './inventario.page';

describe('inventarioPage', () => {
  let component: inventarioPage;
  let fixture: ComponentFixture<inventarioPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [inventarioPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(inventarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
