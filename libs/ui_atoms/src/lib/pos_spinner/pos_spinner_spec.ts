import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PosSpinnerComponent } from './pos_spinner';

describe('PosSpinnerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosSpinnerComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('renderiza el indicador de carga', () => {
    const fixture = TestBed.createComponent(PosSpinnerComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(
        'mat-spinner, .mat-mdc-progress-spinner',
      ),
    ).toBeTruthy();
  });
});
