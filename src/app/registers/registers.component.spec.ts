// ********************************************************
// Registers: tests
// ********************************************************

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistersComponent } from './registers.component';
import { Register } from '../core/register';

describe('RegistersComponent', () => {
  let m_compRegisters: RegistersComponent;
  let m_fixture: ComponentFixture<RegistersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    m_fixture = TestBed.createComponent(RegistersComponent);
    m_compRegisters = m_fixture.componentInstance;
    m_fixture.detectChanges();
  });

  it('should create', () => {
    expect(m_compRegisters).toBeTruthy();
  });

  it('check init registers', () => {
    for (let i = 0; i < Register.REG_COUNT; i++) {
      const regVal = m_compRegisters.m_registersCpu[i];
      if (i !== Register.REG_ESP) {
        expect(regVal).toEqual(0);
      }
    }
  });

  it('check convert to hex', () => {
    const DEC_A = 1982763;
    const DEC_B = 65521;
    const DEC_C = -56;
    const testHexA = m_compRegisters.getHexStringFromDec(DEC_A);
    const testHexB = m_compRegisters.getHexStringFromDec(DEC_B);
    const testHexC = m_compRegisters.getHexStringFromDec(DEC_C);
    expect(testHexA).toEqual('0x001E412B');
    expect(testHexB).toEqual('0x0000FFF1');
    expect(testHexC).toEqual('0xFFFFFFC8');
  });

});
