import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordatorioDirectorPage } from './recordatorio-director.page';

describe('RecordatorioDirectorPage', () => {
  let component: RecordatorioDirectorPage;
  let fixture: ComponentFixture<RecordatorioDirectorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordatorioDirectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
