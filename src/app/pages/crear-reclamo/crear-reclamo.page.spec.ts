import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearReclamoPage } from './crear-reclamo.page';

describe('CrearReclamoPage', () => {
  let component: CrearReclamoPage;
  let fixture: ComponentFixture<CrearReclamoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearReclamoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
