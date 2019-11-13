import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSalidaPage } from './create-salida.page';

describe('CreateSalidaPage', () => {
  let component: CreateSalidaPage;
  let fixture: ComponentFixture<CreateSalidaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSalidaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSalidaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
