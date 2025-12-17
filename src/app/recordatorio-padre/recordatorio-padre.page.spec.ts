import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordatorioPadrePage } from './recordatorio-padre.page';

describe('RecordatorioPadrePage', () => {
  let component: RecordatorioPadrePage;
  let fixture: ComponentFixture<RecordatorioPadrePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordatorioPadrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
