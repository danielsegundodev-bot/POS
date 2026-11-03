import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PosChipComponent } from './pos_chip';

describe('PosChipComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosChipComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('muestra la etiqueta', () => {
    const fixture = TestBed.createComponent(PosChipComponent);
    fixture.componentRef.setInput('label', 'Oferta');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Oferta');
  });

  it('emite removed al retirar el chip', () => {
    const fixture = TestBed.createComponent(PosChipComponent);
    fixture.componentRef.setInput('label', 'Oferta');
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    const removed = jest.fn();
    fixture.componentInstance.removed.subscribe(removed);
    (
      fixture.nativeElement.querySelector('button') as HTMLButtonElement
    ).click();
    expect(removed).toHaveBeenCalledTimes(1);
  });
});
