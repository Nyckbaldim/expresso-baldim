import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrotaEServicos } from './frota-e-servicos';

describe('FrotaEServicos', () => {
  let component: FrotaEServicos;
  let fixture: ComponentFixture<FrotaEServicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrotaEServicos],
    }).compileComponents();

    fixture = TestBed.createComponent(FrotaEServicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
