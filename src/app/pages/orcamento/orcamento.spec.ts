import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Orcamento } from './orcamento';

describe('Orcamento', () => {
  let component: Orcamento;
  let fixture: ComponentFixture<Orcamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Orcamento],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Orcamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
