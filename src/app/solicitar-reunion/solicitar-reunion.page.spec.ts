import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarReunionPage } from './solicitar-reunion.page';

describe('SolicitarReunionComponent', () => {
  let component: SolicitarReunionPage;
  let fixture: ComponentFixture<SolicitarReunionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitarReunionPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitarReunionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
