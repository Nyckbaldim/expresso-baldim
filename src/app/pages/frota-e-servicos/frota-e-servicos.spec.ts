import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { FrotaEServicos } from './frota-e-servicos';

describe('FrotaEServicos', () => {
  let component: FrotaEServicos;
  let fixture: ComponentFixture<FrotaEServicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrotaEServicos],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FrotaEServicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
