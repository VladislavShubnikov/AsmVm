import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructionComponent } from './instruction.component';
import { MemoryDesc } from '../core/memorydesc';
import { LexemType } from '../core/lexemtype';

describe('InstructionComponent test set', () => {
  let m_compInstruction: InstructionComponent;
  let m_fixture: ComponentFixture<InstructionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstructionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    m_fixture = TestBed.createComponent(InstructionComponent);
    m_compInstruction = m_fixture.componentInstance;
    m_fixture.detectChanges();
  });

  it('should create', () => {
    expect(m_compInstruction).toBeTruthy();
  });

  it('check memory desc', () => {
    const md = new MemoryDesc();
    expect(md.m_flagRegBase).toEqual(false);
    expect(md.m_flagRegIndex).toEqual(false);
    expect(md.m_flagImmScale).toEqual(false);
    expect(md.m_flagImmAdd).toEqual(false);
  });

  it('check init instruction component', () => {
    const IVALID_VAL = -1;
    expect(m_compInstruction.m_labelCode).toEqual(IVALID_VAL);
    expect(m_compInstruction.m_instruction).toEqual(LexemType.LEXEM_NA);
  });

});
