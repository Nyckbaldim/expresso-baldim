import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paginacao } from './paginacao';

describe('Paginacao', () => {
  let componente: Paginacao;
  let fixture: ComponentFixture<Paginacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paginacao],
    }).compileComponents();

    fixture = TestBed.createComponent(Paginacao);
    fixture.componentRef.setInput('pagina', 2);
    fixture.componentRef.setInput('tamanhoPagina', 10);
    fixture.componentRef.setInput('total', 47);
    componente = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('exibe as páginas e o intervalo correspondentes', () => {
    expect(componente).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('11');
    expect(fixture.nativeElement.textContent).toContain('20');
    expect(fixture.nativeElement.textContent).toContain('47');
  });
});
