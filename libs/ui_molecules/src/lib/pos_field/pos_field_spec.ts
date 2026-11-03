import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PosFieldComponent } from './pos_field';

describe('PosFieldComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosFieldComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('muestra la etiqueta', () => {
    const fixture = TestBed.createComponent(PosFieldComponent);
    fixture.componentRef.setInput('label', 'SKU');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('SKU');
  });

  it('muestra el error cuando existe', () => {
    const fixture = TestBed.createComponent(PosFieldComponent);
    fixture.componentRef.setInput('label', 'SKU');
    fixture.componentRef.setInput('error', 'Campo obligatorio');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Campo obligatorio');
  });
});
