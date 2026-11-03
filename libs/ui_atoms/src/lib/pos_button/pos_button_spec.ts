import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PosButtonComponent } from './pos_button';

describe('PosButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosButtonComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('renderiza el contenido proyectado', () => {
    const fixture = TestBed.createComponent(PosButtonComponent);
    fixture.nativeElement.appendChild(document.createTextNode('Cobrar'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cobrar');
  });

  it('emite pressed al hacer clic', () => {
    const fixture = TestBed.createComponent(PosButtonComponent);
    fixture.detectChanges();
    const pressed = jest.fn();
    fixture.componentInstance.pressed.subscribe(pressed);
    (
      fixture.nativeElement.querySelector('button') as HTMLButtonElement
    ).click();
    expect(pressed).toHaveBeenCalledTimes(1);
  });

  it('deshabilita el botón mientras carga', () => {
    const fixture = TestBed.createComponent(PosButtonComponent);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector('button') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});
