import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstrSetComponent } from './instrset.component';
import { Compiler } from '../core/compiler';
import { LexemType } from '../core/lexemtype';
import { OperandType } from '../core/operandtype';
import { Register } from '../core/register';


describe('InstrSetComponent', () => {
  let component: InstrSetComponent;
  let fixture: ComponentFixture<InstrSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstrSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*
  it('check compiler code reg scale', () => {
    const compiler = new Compiler();
    const codeStr = 'mov ECX, [EBX * 8 + 987]';
    const setInstr = new InstrSetComponent();
    const errCompile = compiler.createCode(codeStr, setInstr);
    expect(errCompile).toEqual(true);
    if (!errCompile) {
      const strErr = compiler.m_strErr;
      console.log(`Comple error = ${strErr}`);
    }
    if (errCompile) {
      const instr = setInstr.m_instructions[0];
      expect(instr.m_instruction).toEqual(LexemType.LEXEM_OP_MOV);
      expect(instr.m_operandDst.m_operandType).toEqual(OperandType.OPERAND_REGISTER);
      expect(instr.m_operandSrc.m_operandType).toEqual(OperandType.OPERAND_MEMORY);
      expect(instr.m_operandDst.m_register).toEqual(Register.REG_ECX);
      const memSrc = instr.m_operandSrc.m_memoryDesc;
      expect(memSrc.m_flagRegIndex).toEqual(true);
      expect(memSrc.m_flagRegBase).toEqual(false);
      expect(memSrc.m_flagImmScale).toEqual(true);
      expect(memSrc.m_flagImmAdd).toEqual(true);

      expect(memSrc.m_registerIndex).toEqual(Register.REG_EBX);
      const MAG_SCALE = 8;
      const MAG_ADD = 987;
      expect(memSrc.m_immScale).toEqual(MAG_SCALE);
      expect(memSrc.m_immAdd).toEqual(MAG_ADD);
    }
  });

  it('check compiler wrong scale', () => {
    const compiler = new Compiler();
    const codeStr = '  add EAX, DWORD PTR [ESP + EDX * 18 + 9]';
    const setInstr = new InstrSetComponent();
    const errCompile = compiler.createCode(codeStr, setInstr);
    expect(errCompile).toEqual(false);
    if (!errCompile) {
      const strErr = compiler.m_strErr;
      console.log(`Expected compile error = ${strErr}`);
    }
  });

  it('check compiler correct mem referencing', () => {
    const compiler = new Compiler();
    const codeStrArr = [
      'mov DWORD PTR[EBP - 96], 3456',
      'mov EAX, DWORD PTR[ESI + ECX * 4 - 4]',
      'mov DWORD PTR[EBP - 40 + ECX * 4], EBX',
      'mov EAX, DWORD PTR[EBP - 80 + EAX * 4]',
      'mov DWORD PTR[EBP - 200 + EDI * 4], EAX',
      'add EBX, DWORD PTR[EBP - 200]',
    ];
    const codeNumLines = codeStrArr.length;
    let i;
    let codeAll = '';
    for (i = 0; i < codeNumLines; i++) {
      codeAll += codeStrArr[i];
      if (i < codeNumLines - 1) {
        codeAll += '\n';
      }
    }
    const setInstr = new InstrSetComponent();
    const errCompile = compiler.createCode(codeAll, setInstr);
    expect(errCompile).toEqual(true);
    if (!errCompile) {
      const strA = compiler.m_strErr;
      console.log(`Unexpected compile error = ${strA}`);
    }

  });
  */

  /*
  it('check compiler code labels only', () => {
    const compiler = new Compiler();
    const codeStr = 'LabelAgain: \n jmp LabelAgain';
    const setInstr = new InstrSetComponent();
    const errCompile = compiler.createCode(codeStr, setInstr);
    expect(errCompile).toEqual(true);
    const numCompiledInstr = setInstr.m_instructions.length;
    // console.log(`Num compiled Instructions = ${numCompiledInstr}`);
    expect(setInstr.m_instructions[0].m_labelCode).toEqual(0);
    expect(setInstr.m_instructions[0].m_instruction).toEqual(LexemType.LEXEM_OP_NOP);

    const FAIL_VAL = -1;
    expect(setInstr.m_instructions[1].m_labelCode).toEqual(FAIL_VAL);
    expect(setInstr.m_instructions[1].m_instruction).toEqual(LexemType.LEXEM_OP_JMP);

  });

  it('check compiler 3 instrs', () => {
    const compiler = new Compiler();
    const codeA = 'mov EAX, 5\n\
    add ECX, EAX\n\
    dec ESP';
    const setInstrA = new InstrSetComponent();
    // console.log(`Num Instructions before = ${setInstrA.m_instructions.length}`);
    const errA = compiler.createCode(codeA, setInstrA);
    expect(errA).toEqual(true);
    if (!errA) {
      const strA = compiler.m_strErr;
      console.log(`Unexpected compile error = ${strA}`);
    }
    const numInstr = setInstrA.m_instructions.length;
    const NUM_3 = 3;
    expect(numInstr).toEqual(NUM_3);
    // console.log(`Num Instructions = ${numInstr}`);
    for (let i = 0; i < numInstr; i++) {
      const instr = setInstrA.m_instructions[i];
      const strInstDebug = instr.getString();
      // console.log(`Instruction = ${strInstDebug}`);
      // compiler.debugConsolePrintObject('Added instruction in set: ', instr);
    }
    const OFF_0 = 0;
    const OFF_1 = 1;
    const OFF_2 = 2;
    expect(setInstrA.m_instructions[OFF_0].m_instruction).toEqual(LexemType.LEXEM_OP_MOV);
    expect(setInstrA.m_instructions[OFF_1].m_instruction).toEqual(LexemType.LEXEM_OP_ADD);
    expect(setInstrA.m_instructions[OFF_2].m_instruction).toEqual(LexemType.LEXEM_OP_DEC);

    expect(setInstrA.m_instructions[OFF_0].m_operandDst.m_operandType).toEqual(OperandType.OPERAND_REGISTER);
    expect(setInstrA.m_instructions[OFF_1].m_operandDst.m_operandType).toEqual(OperandType.OPERAND_REGISTER);
    expect(setInstrA.m_instructions[OFF_2].m_operandDst.m_operandType).toEqual(OperandType.OPERAND_REGISTER);

    expect(setInstrA.m_instructions[OFF_0].m_operandDst.m_register).toEqual(Register.REG_EAX);
    expect(setInstrA.m_instructions[OFF_1].m_operandDst.m_register).toEqual(Register.REG_ECX);
    expect(setInstrA.m_instructions[OFF_2].m_operandDst.m_register).toEqual(Register.REG_ESP);
  });

  it('check compiler code concatenation simple', () => {
    const compiler = new Compiler();
    const codeStrArr = [
      'mov ECX, 8',
      'LabelAgain:',
      'mov ESI, 765',
      'add EBP, [EAX]',
      'dec ECX',
      'cmp ECX, 3',
      'jnz LabelAgain'
    ];
    const codeNumLines = codeStrArr.length;
    let i;
    let codeAll = '';
    for (i = 0; i < codeNumLines; i++) {
      codeAll += codeStrArr[i];
      if (i < codeNumLines - 1) {
        codeAll += '\n';
      }
    }
    const setInstr = new InstrSetComponent();
    const errCompile = compiler.createCode(codeAll, setInstr);
    expect(errCompile).toEqual(true);
    if (!errCompile) {
      const strA = compiler.m_strErr;
      console.log(`Unexpected comple error = ${strA}`);
    }
    const numCompiledInstr = setInstr.m_instructions.length;
    // console.log(`Num compiled Instructions = ${numCompiledInstr}`);
    expect(numCompiledInstr).toEqual(codeNumLines);
    const INSTR_LABEL = 1;
    const INSTR_JUMP = 6;
    for (i = 0; i < numCompiledInstr; i++) {
      const instr = setInstr.m_instructions[i];
      const strInstDebug = instr.getString();
      if ((i !== INSTR_LABEL) && (i !== INSTR_JUMP)) {
        const isEq = (strInstDebug === codeStrArr[i]);
        expect(isEq).toEqual(true);
        if (!isEq) {
          console.log(`Should be equal. In = ${codeStrArr[i]}. Out = ${strInstDebug}`)
        }
      }
      // console.log(`InstructionCompiled = ${strInstDebug}`);
    }
  });

  it('test preprocess many labels', () => {
    const compiler = new Compiler();
    const codeStrArr = [
      'mov ECX, [EAX * 20]',
      'LabelA:',
      '  cmp ECX, 1',
      '  jge LabelD',
      '  add EAX, DWORD PTR [ESP + EDX * 18 + 9]',
      '  jge LabelC',
      '  cmp ECX, 7',
      '  jb LabelB',
      'LabelB:',
      '  add EAX, [ESP]',
      '  jmp LabelBack',
      'LabelC:',
      '  sub EAX, 8',
      'LabelBack:',
      '  jmp LabelA',
      'LabelD:',
      '  xor EAX, EAX',
    ];
    const codeNumLines = codeStrArr.length;
    let i;
    let codeAll = '';
    for (i = 0; i < codeNumLines; i++) {
      codeAll += codeStrArr[i];
      if (i < codeNumLines - 1) {
        codeAll += '\n';
      }
    }
    const strCodePrep = compiler.preprocessCode(codeAll);
    expect(compiler.m_strErr.length).toEqual(0);
    // console.log(`Comple preprocessed string = <${strCodePrep}>`);

    const setInstr = new InstrSetComponent();
    const errCompile = compiler.createCode(codeAll, setInstr);
    expect(errCompile).toEqual(true);

    const numCompiledInstr = setInstr.m_instructions.length;
    expect(numCompiledInstr).toEqual(codeNumLines);
    for (i = 0; i < numCompiledInstr; i++) {
      const instr = setInstr.m_instructions[i];
      const strInstDebug = instr.getString();
      console.log(`Compiled line = ${strInstDebug}`);
    }

  });
  */

  it('check compiler code concatenation large example', () => {
    const compiler = new Compiler();
    const codeStrArr = [
      '; a022 Variable bit encoding',
      'push EBP',
      '; Init const arrays',
      'mov EBP, ESP',
      'mov DWORD PTR[EBP - 100], 12',
      'mov DWORD PTR[EBP - 96], 3456',
      'mov DWORD PTR[EBP - 90], 34',
      'mov DWORD PTR[EBP - 86], 56',
      'mov DWORD PTR[EBP - 80], 1',
      'mov DWORD PTR[EBP - 76], 2',
      'mov DWORD PTR[EBP - 70], 3',
      'mov DWORD PTR[EBP - 66], 4',
      'mov DWORD PTR[EBP - 60], 5',
      'mov DWORD PTR[EBP - 56], 6',
      'LabelNextCode:',
      '; next code',
      '  mov EAX, DWORD PTR[ESI + ECX * 4 - 4]',
      '  ; extract bits into array[EBP - 40]',
      '  push ECX',
      '  xor ECX, ECX',
      'LabelNextBitExtract :',
      '  mov EBX, EAX',
      '  and EBX, 1',
      '  mov DWORD PTR[EBP - 40 + ECX * 4], EBX',
      '  shr EAX, 1',
      '  inc ECX',
      '  cmp ECX, 9',
      '  jl  LabelNextBitExtract',
      '  ; numDigitsOut = EDI',
      '  xor EDI, EDI',
      '  ; bitIndex = ECX',
      '  xor ECX, ECX',
      '  ; state = EBX',
      '  mov EBX, 0',
      'LabelNextBitArr:',
      '  ; bit = > EAX',
      '  mov EAX, DWORD PTR[EBP - 40 + ECX * 4]',
      '  cmp EBX, 0',
      '  je  LabelStateRoot',
      '  cmp EBX, 12',
      '  je LabelState12',
      '  cmp EBX, 3456',
      '  je LabelState_3456',
      '  cmp EBX, 34',
      '  je LabelState34',
      '  cmp EBX, 56',
      '  je LabelState56',
      'LabelStateRoot :',
      '  ; state = (StateHuff)selRoot[bit];',
      '  mov EBX, DWORD PTR[EBP - 100 + EAX * 4]',
      '  jmp LabelEndGetBit',
      'LabelState_3456 :',
      '  ; state = (StateHuff)sel3456[bit];',
      '  mov EBX, DWORD PTR[EBP - 90 + EAX * 4]',
      '  jmp LabelEndGetBit',
      'LabelState12 :',
      '  ; digits[numDigitsOut++] = res12[bit];',
      '  ; state = STATE_HUFFMAN_ROOT;   // 0',
      '  mov EAX, DWORD PTR[EBP - 80 + EAX * 4]',
      '  mov DWORD PTR[EBP - 200 + EDI * 4], EAX',
      '  inc EDI',
      '  xor EBX, EBX',
      '  jmp LabelEndGetBit',
      ' ',
      'LabelState34 :',
      '  ; digits[numDigitsOut++] = res34[bit];',
      '  ; state = STATE_HUFFMAN_ROOT;   // 0',
      '  mov EAX, DWORD PTR[EBP - 70 + EAX * 4]',
      '  mov DWORD PTR[EBP - 200 + EDI * 4], EAX',
      '  inc EDI',
      '  xor EBX, EBX',
      '  jmp LabelEndGetBit',
      ' ',
      'LabelState56 :',
      '  ; digits[numDigitsOut++] = res56[bit];',
      '  ; state = STATE_HUFFMAN_ROOT;   // 0',
      '  mov EAX, DWORD PTR[EBP - 60 + EAX * 4]',
      '  mov DWORD PTR[EBP - 200 + EDI * 4], EAX',
      '  inc EDI',
      '  xor EBX, EBX',
      ' ',
      'LabelEndGetBit:',
      '  inc ECX',
      '  cmp ECX, 9',
      '  jl  LabelNextBitArr',
      '  pop ECX',
      '  ; create number from 3 extracted digits',
      '  ; placed in [EBP - 200] ... ',
      '  xor EBX, EBX ',
      '  add EBX, DWORD PTR[EBP - 200]',
      '  mov EAX, 10',
      '  mul DWORD PTR [EBP - 196]',
      '  add EBX, EAX',
      '  mov EAX, 100',
      '  mul DWORD PTR[EBP - 192]',
      '  add EBX, EAX',
      ' ',
      '  ; write number to source array',
      '  mov DWORD PTR[ESI + ECX * 4 - 4], EBX',
      '  ; next code',
      '  dec ECX',
      '  jnz LabelNextCode',
      '  pop EBP',
    ];
    const codeNumLines = codeStrArr.length;
    let i;
    let codeAll = '';
    for (i = 0; i < codeNumLines; i++) {
      codeAll += codeStrArr[i];
      if (i < codeNumLines - 1) {
        codeAll += '\n';
      }
    }
    const strCodePrep = compiler.preprocessCode(codeAll);
    // console.log(`Comple preprocessed string = <${strCodePrep}>`);
    expect(strCodePrep.length).toBeGreaterThan(0);

    const setInstr = new InstrSetComponent();
    const errCompile = compiler.createCode(codeAll, setInstr);
    expect(errCompile).toEqual(true);
    if (!errCompile) {
      const strA = compiler.m_strErr;
      console.log(`Unexpected compile error = ${strA}`);
    }
    const TWO = 2;
    const numCompiledInstr = setInstr.m_instructions.length;
    console.log(`TEST. Num compiled Instructions = ${numCompiledInstr}`);
    expect(numCompiledInstr).toBeLessThan(codeNumLines);
    expect(numCompiledInstr).toBeGreaterThan(codeNumLines / TWO);
    const INSTR_LABEL = 1;
    const INSTR_JUMP = 6;
    for (i = 0; i < numCompiledInstr; i++) {
      const instr = setInstr.m_instructions[i];
      const strInstDebug = instr.getString();
      console.log(`TEST. Instruction[${i}] = ${strInstDebug}`);
      /*
      if ((i !== INSTR_LABEL) && (i !== INSTR_JUMP)) {
        const isEq = (strInstDebug === codeStrArr[i]);
        expect(isEq).toEqual(true);
        if (!isEq) {
          console.log(`TEST. Should be equal. In = ${codeStrArr[i]}. Out = ${strInstDebug}`);
        }
      } // if some special instructions
      */
      // console.log(`InstructionCompiled = ${strInstDebug}`);
    }
  });
});
