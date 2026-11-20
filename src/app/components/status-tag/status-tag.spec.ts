import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusTag } from './status-tag';

describe('StatusTag', () => {
  let component: StatusTag;
  let fixture: ComponentFixture<StatusTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusTag],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusTag);
    fixture.componentRef.setInput('status', 'RECEBIDO');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
