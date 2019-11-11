import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBodegaPage } from './create-bodega.page';

describe('CreateBodegaPage', () => {
  let component: CreateBodegaPage;
  let fixture: ComponentFixture<CreateBodegaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateBodegaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBodegaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
