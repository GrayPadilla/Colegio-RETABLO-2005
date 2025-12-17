import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReunionesProgramadasPadrePage } from './reuniones-programadas-padre.page';

describe('ReunionesProgramadasDirectorPage', () => {
  let component: ReunionesProgramadasPadrePage;
  let fixture: ComponentFixture<ReunionesProgramadasPadrePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReunionesProgramadasPadrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
