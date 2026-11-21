import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DetalhePedido } from './detalhe-pedido';

describe('DetalhePedido', () => {
  let componente: DetalhePedido;
  let fixture: ComponentFixture<DetalhePedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhePedido],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhePedido);
    componente = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('é criada sem um pedido selecionado', () => {
    expect(componente).toBeTruthy();
  });
});
