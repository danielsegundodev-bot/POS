import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { appRoutes } from './app_routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();
  });

  it('crea la aplicación con el router', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });

  it('declara las rutas principales del POS', () => {
    const children = appRoutes[0].children ?? [];
    const paths = children.map((route) => route.path);
    expect(paths).toEqual(
      expect.arrayContaining([
        'inicio',
        'productos',
        'inventario',
        'ventas',
        'clientes',
        'reportes',
        'configuracion',
      ]),
    );
  });
});
