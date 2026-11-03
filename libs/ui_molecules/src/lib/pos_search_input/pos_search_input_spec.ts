import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PosSearchInputComponent } from './pos_search_input';

describe('PosSearchInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosSearchInputComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('emite valueChange al escribir', () => {
    const fixture = TestBed.createComponent(PosSearchInputComponent);
    fixture.detectChanges();
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = 'cafe';
    input.dispatchEvent(new Event('input'));
    expect(emitted).toEqual(['cafe']);
  });

  it('limpia el valor con el botón de cerrar', () => {
    const fixture = TestBed.createComponent(PosSearchInputComponent);
    fixture.componentRef.setInput('value', 'cafe');
    fixture.detectChanges();
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));
    (
      fixture.nativeElement.querySelector('button') as HTMLButtonElement
    ).click();
    expect(emitted).toEqual(['']);
  });
});
