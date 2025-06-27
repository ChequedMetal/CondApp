import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionarAnunciosPage } from './gestionar-anuncios.page';

describe('GestionarAnunciosPage', () => {
  let component: GestionarAnunciosPage;
  let fixture: ComponentFixture<GestionarAnunciosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarAnunciosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
