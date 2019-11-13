import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateIngresoPage } from './create-ingreso.page';

describe('CreateIngresoPage', () => {
  let component: CreateIngresoPage;
  let fixture: ComponentFixture<CreateIngresoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateIngresoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateIngresoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
