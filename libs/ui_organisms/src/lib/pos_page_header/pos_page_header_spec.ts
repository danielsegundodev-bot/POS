import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PosPageHeaderComponent } from './pos_page_header';

describe('PosPageHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosPageHeaderComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('muestra el título y el subtítulo', () => {
    const fixture = TestBed.createComponent(PosPageHeaderComponent);
    fixture.componentRef.setInput('title', 'Productos');
    fixture.componentRef.setInput('subtitle', 'Catálogo general');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Productos');
    expect(text).toContain('Catálogo general');
  });
});
