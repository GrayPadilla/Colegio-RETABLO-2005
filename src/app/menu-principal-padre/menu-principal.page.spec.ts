import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuPrincipalPage } from './menu-principal.page';
import { RouterTestingModule } from '@angular/router/testing';

describe('MenuPrincipalPage', () => {
  let component: MenuPrincipalPage;
  let fixture: ComponentFixture<MenuPrincipalPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuPrincipalPage, RouterTestingModule] // <-- CORREGIDO
    }).compileComponents();

    fixture = TestBed.createComponent(MenuPrincipalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
