import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthApi } from '@pos/data-access';
import { NAV_ITEMS } from '../nav_items';
import { PosShellComponent } from './pos_shell';

describe('PosShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosShellComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthApi, useValue: { login: jest.fn() } },
      ],
    }).compileComponents();
  });

  it('renderiza todos los enlaces de navegación', () => {
    const fixture = TestBed.createComponent(PosShellComponent);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('a[routerlink], a');
    expect(links.length).toBe(NAV_ITEMS.length);
  });

  it('muestra el título de la página en la barra superior', () => {
    const fixture = TestBed.createComponent(PosShellComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('mat-toolbar').textContent,
    ).toContain('POS');
  });
});
