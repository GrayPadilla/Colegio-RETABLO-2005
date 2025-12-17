import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificacionesDirectorPage } from './notificaciones-director.page';

describe('NotificacionesDirectorPage', () => {
  let component: NotificacionesDirectorPage;
  let fixture: ComponentFixture<NotificacionesDirectorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificacionesDirectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
