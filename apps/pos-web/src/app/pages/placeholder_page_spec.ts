import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { PlaceholderPageComponent } from './placeholder_page';

describe('PlaceholderPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceholderPageComponent, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { title: 'Productos' },
              params: convertToParamMap({}),
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('muestra el título de la ruta', () => {
    const fixture = TestBed.createComponent(PlaceholderPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Productos');
    expect(fixture.nativeElement.textContent).toContain('en construcción');
  });
});
