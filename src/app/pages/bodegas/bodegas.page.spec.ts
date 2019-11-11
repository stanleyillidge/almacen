import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BodegasPage } from './bodegas.page';

describe('BodegasPage', () => {
  let component: BodegasPage;
  let fixture: ComponentFixture<BodegasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BodegasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BodegasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
