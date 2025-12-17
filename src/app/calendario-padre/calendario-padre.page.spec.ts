import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarioPadrePage } from './calendario-padre.page';

describe('CalendarioPadrePage', () => {
  let component: CalendarioPadrePage;
  let fixture: ComponentFixture<CalendarioPadrePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarioPadrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
