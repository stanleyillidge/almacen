import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalidasPage } from './salidas.page';

describe('SalidasPage', () => {
  let component: SalidasPage;
  let fixture: ComponentFixture<SalidasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalidasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalidasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
