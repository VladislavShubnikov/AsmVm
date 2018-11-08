import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegflagsComponent } from './regflags.component';
import { RegFlags } from '../core/regflags';

describe('RegflagsComponent', () => {
  let regFlagsComponent: RegflagsComponent;
  let fixture: ComponentFixture<RegflagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegflagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegflagsComponent);
    regFlagsComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(regFlagsComponent).toBeTruthy();
  });
  it('set all flags', () => {
    const ALL_BITS = 16383;
    regFlagsComponent.setFlags(ALL_BITS);
    const NUM_BITS = 7;
    let i;
    for (i = 0; i < NUM_BITS; i++) {
      expect(regFlagsComponent.m_bits[i]).toEqual(1);
    }
  });
  it('set zero flag', () => {
    // tslint:disable-next-line:no-bitwise
    const FLAGS = (1 << RegFlags.BIT_ZERO);
    regFlagsComponent.setFlags(FLAGS);
    const NUM_BITS = 7;
    const INDEX_ZERO = 3;
    let i;
    for (i = 0; i < NUM_BITS; i++) {
      const expectVal = (i === INDEX_ZERO) ? 1 : 0;
      expect(regFlagsComponent.m_bits[i]).toEqual(expectVal);
    }
  });

});
