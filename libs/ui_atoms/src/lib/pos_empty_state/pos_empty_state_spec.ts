import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PosEmptyStateComponent } from './pos_empty_state';

describe('PosEmptyStateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosEmptyStateComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('muestra título y mensaje', () => {
    const fixture = TestBed.createComponent(PosEmptyStateComponent);
    fixture.componentRef.setInput('title', 'Sin productos');
    fixture.componentRef.setInput('message', 'Agrega tu primer producto');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Sin productos');
    expect(text).toContain('Agrega tu primer producto');
  });
});
