import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarioDirectorPage } from './calendario-director.page';

describe('CalendarioDirectorPage', () => {
  let component: CalendarioDirectorPage;
  let fixture: ComponentFixture<CalendarioDirectorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarioDirectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
