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
});
