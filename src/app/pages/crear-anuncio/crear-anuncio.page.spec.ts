import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearAnuncioPage } from './crear-anuncio.page';

describe('CrearAnuncioPage', () => {
  let component: CrearAnuncioPage;
  let fixture: ComponentFixture<CrearAnuncioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearAnuncioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
