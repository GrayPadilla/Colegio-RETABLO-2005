import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificacionesPadrePage } from './notificaciones-padre.page';

describe('NotificacionesPadrePage', () => {
  let component: NotificacionesPadrePage;
  let fixture: ComponentFixture<NotificacionesPadrePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificacionesPadrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
