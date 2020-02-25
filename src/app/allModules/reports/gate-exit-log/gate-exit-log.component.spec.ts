import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GateExitLogComponent } from './gate-exit-log.component';

describe('GateExitLogComponent', () => {
  let component: GateExitLogComponent;
  let fixture: ComponentFixture<GateExitLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GateExitLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GateExitLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
