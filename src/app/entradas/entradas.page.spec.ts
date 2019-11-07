import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntradasPage } from './entradas.page';

describe('EntradasPage', () => {
  let component: EntradasPage;
  let fixture: ComponentFixture<EntradasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntradasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntradasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
