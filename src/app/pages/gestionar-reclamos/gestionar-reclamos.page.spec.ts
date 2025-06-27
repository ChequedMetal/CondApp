import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionarReclamosPage } from './gestionar-reclamos.page';

describe('GestionarReclamosPage', () => {
  let component: GestionarReclamosPage;
  let fixture: ComponentFixture<GestionarReclamosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarReclamosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
