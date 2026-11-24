import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SobreNos } from './sobre-nos';

describe('SobreNos', () => {
  let component: SobreNos;
  let fixture: ComponentFixture<SobreNos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SobreNos],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SobreNos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
