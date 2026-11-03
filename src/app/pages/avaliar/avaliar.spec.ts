import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Avaliar } from './avaliar';

describe('Avaliar', () => {
  let component: Avaliar;
  let fixture: ComponentFixture<Avaliar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avaliar],
    }).compileComponents();

    fixture = TestBed.createComponent(Avaliar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
