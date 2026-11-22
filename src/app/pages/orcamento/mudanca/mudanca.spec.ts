import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Mudanca } from './mudanca';

describe('Mudanca', () => {
  let component: Mudanca;
  let fixture: ComponentFixture<Mudanca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mudanca],
    }).compileComponents();

    fixture = TestBed.createComponent(Mudanca);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adiciona itens e calcula quantidade e volume', () => {
    component.adicionarMovel();
    component.moveis.update((lista) => lista.map((item, indice) =>
      indice === 0
        ? { ...item, nome: 'Sofá', quantidade: 2, volumeM3: 1.5 }
        : item,
    ));
    component.form.controls.moveis.setValue(component.moveis());

    expect(component.itens()).toBe(2);
    expect(component.volume()).toBe(3);

    component.removerMovel(0);
    expect(component.moveis()).toEqual([]);
  });
});
