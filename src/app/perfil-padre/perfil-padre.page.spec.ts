import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilPadrePage } from './perfil-padre.page';

describe('PerfilPadrePage', () => {
  let component: PerfilPadrePage;
  let fixture: ComponentFixture<PerfilPadrePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilPadrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
