import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionarMercadoPage } from './gestionar-mercado.page';

describe('GestionarMercadoPage', () => {
  let component: GestionarMercadoPage;
  let fixture: ComponentFixture<GestionarMercadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarMercadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
