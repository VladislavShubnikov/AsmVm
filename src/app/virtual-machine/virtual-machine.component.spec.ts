import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualMachineComponent } from './virtual-machine.component';
import { InstrSetComponent } from '../instrset/instrset.component';
import { LexemType } from '../core/lexemtype';
import { Compiler } from '../core/compiler';
import { Register } from '../core/register';


describe('VirtualMachineComponent', () => {
  let virtMachine: VirtualMachineComponent;
  let fixture: ComponentFixture<VirtualMachineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VirtualMachineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualMachineComponent);
    virtMachine = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('perform 2 instr xor, mov by virtual machine', () => {
    const codeAll = 'xor EAX, EAX\nmov EBX, 4';
    const compiler = new Compiler();
    const setInstr = new InstrSetComponent();
    const errCompile = compiler.createCode(codeAll, setInstr);
    expect(errCompile).toEqual(true);
    if (!errCompile) {
      console.log(`Unexpected compile error = ${ compiler.m_strErr}`);
    }
    virtMachine.setupInstructionSet(setInstr);
    const numInstructions = setInstr.m_instructions.length;
    const NUM_INSTR_2 = 2;
    expect(numInstructions).toEqual(NUM_INSTR_2);
    const instr0 = setInstr.m_instructions[virtMachine.m_curInstructionIndex];
    virtMachine.m_curInstructionIndex++;
    const instr1 = setInstr.m_instructions[virtMachine.m_curInstructionIndex];
    virtMachine.m_curInstructionIndex++;

    expect(typeof instr0.m_operandSrc !== 'undefined').toEqual(true);
    expect(typeof instr0.m_operandDst !== 'undefined').toEqual(true);
    expect(typeof instr1.m_operandSrc !== 'undefined').toEqual(true);
    expect(typeof instr1.m_operandDst !== 'undefined').toEqual(true);
    expect(instr0.m_instruction).toEqual(LexemType.LEXEM_OP_XOR);
    expect(instr1.m_instruction).toEqual(LexemType.LEXEM_OP_MOV);

    const funcCall0 = virtMachine.m_backends[instr0.m_instruction];
    const funcCall1 = virtMachine.m_backends[instr1.m_instruction];

    expect(funcCall0 !== null).toEqual(true);
    expect(funcCall1 !== null).toEqual(true);

    const opDst0 = instr0.m_operandDst;
    const opSrc0 = instr0.m_operandSrc;
    const valDst0 = virtMachine.getDataFromOperand(opDst0);
    const valSrc0 = virtMachine.getDataFromOperand(opSrc0);
    expect(valDst0 === 0).toEqual(true);
    expect(valSrc0 === 0).toEqual(true);
    // tslint:disable-next-line
    let res = valDst0 ^ valSrc0;
    virtMachine.putDataToOperand(opDst0, res);

    const FOUR = 4;

    const opDst1 = instr1.m_operandDst;
    const opSrc1 = instr1.m_operandSrc;
    const valDst1 = virtMachine.getDataFromOperand(opDst1);
    const valSrc1 = virtMachine.getDataFromOperand(opSrc1);
    expect(valDst1 === 0).toEqual(true);
    expect(valSrc1 === FOUR).toEqual(true);
    res = valSrc1;
    virtMachine.putDataToOperand(opDst1, res);
    let regEBX;
    regEBX = virtMachine.m_registers[Register.REG_EBX];
    expect(regEBX === FOUR).toEqual(true);

    virtMachine.performInstruction(instr0);
    virtMachine.performInstruction(instr1);
    const regEAX = virtMachine.m_registers[Register.REG_EAX];
    expect(regEAX === 0).toEqual(true);
    regEBX = virtMachine.m_registers[Register.REG_EBX];
    expect(regEBX === FOUR).toEqual(true);

    virtMachine.m_codeFinished = true;
  });

  it('perform 3 instr xor, mov, add by virtual machine', () => {
    const codeAll = 'xor ECX, ECX\nmov ECX, 4\nadd ECX, 3';
    const compiler = new Compiler();
    const setInstr = new InstrSetComponent();
    const errCompile = compiler.createCode(codeAll, setInstr);
    expect(errCompile).toEqual(true);
    if (!errCompile) {
      console.log(`Unexpected compile error = ${ compiler.m_strErr}`);
    }
    virtMachine.setupInstructionSet(setInstr);
    const numInstructions = setInstr.m_instructions.length;
    const NUM_INSTR_3 = 3;
    expect(numInstructions).toEqual(NUM_INSTR_3);
    while (virtMachine.m_curInstructionIndex < numInstructions) {
      const instr = setInstr.m_instructions[virtMachine.m_curInstructionIndex];
      const retInstr = virtMachine.performInstruction(instr);
      expect(retInstr).toEqual(1);
      virtMachine.m_curInstructionIndex++;
      if ((virtMachine.m_curInstructionIndex === numInstructions) && (!virtMachine.m_codeFinished)) {
        virtMachine.m_codeFinished = true;
      }
    }
    expect(virtMachine.m_codeFinished).toEqual(true);
    const regECX = virtMachine.m_registers[Register.REG_ECX];
    const SEVEN = 7;
    expect(regECX === SEVEN).toEqual(true);

  });

  it('perform 3 instr mov, add, xor by virtual machine', () => {
    const codeAll = 'mov ECX, 4\nadd ECX, 3\nxor ECX, 15';
    const compiler = new Compiler();
    const setInstr = new InstrSetComponent();
    const errCompile = compiler.createCode(codeAll, setInstr);
    expect(errCompile).toEqual(true);
    if (!errCompile) {
      console.log(`Unexpected compile error = ${ compiler.m_strErr}`);
    }
    virtMachine.setupInstructionSet(setInstr);
    const numInstructions = setInstr.m_instructions.length;
    const NUM_INSTR_3 = 3;
    expect(numInstructions).toEqual(NUM_INSTR_3);
    while (virtMachine.m_curInstructionIndex < numInstructions) {
      const instr = setInstr.m_instructions[virtMachine.m_curInstructionIndex];
      const retInstr = virtMachine.performInstruction(instr);
      expect(retInstr).toEqual(1);
      virtMachine.m_curInstructionIndex++;
      if ((virtMachine.m_curInstructionIndex === numInstructions) && (!virtMachine.m_codeFinished)) {
        virtMachine.m_codeFinished = true;
      }
    }
    expect(virtMachine.m_codeFinished).toEqual(true);
    const regECX = virtMachine.m_registers[Register.REG_ECX];
    // console.log(`regECX = ${regECX}`);
    // (4 + 3) ^ 15 == 8
    const EIGHT = 8;
    expect(regECX === EIGHT).toEqual(true);

  });

  it('perform instructions by virtual machine', () => {
    // TODO: simple short asm code should be successfully performed
    // step by step. 1: compile. 2: perform in VM.

    /*
    const codeStrArr = [
      '  xor EAX, EAX',
      'LabelAgain:',
      '  add EAX, DWORD PTR [ESI + ECX*4 - 4]',
      '  dec ECX',
      '  jnz labelAgain',
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
    const compiler = new Compiler();
    const setInstr = new InstrSetComponent();
    const errCompile = compiler.createCode(codeAll, setInstr);
    expect(errCompile).toEqual(true);
    if (!errCompile) {
      console.log(`Unexpected compile error = ${ compiler.m_strErr}`);
    }

    virtMachine.setupInstructionSet(setInstr);
    const numInstructions = setInstr.m_instructions.length;
    while (virtMachine.m_curInstructionIndex < numInstructions) {
      const instr = setInstr.m_instructions[virtMachine.m_curInstructionIndex];
      if (instr.m_instruction === LexemType.LEXEM_OP_NOP) {
        // next instruction
        virtMachine.m_curInstructionIndex++;
        if ((virtMachine.m_curInstructionIndex === numInstructions) && (!virtMachine.m_codeFinished)) {
          virtMachine.m_codeFinished = true;
          // s_winConsole.addString("Code completed");
          // _addVmDataArrayToConsole();
        }
      } // if NOP
      virtMachine.m_numInstructionsPerformed++;
      if (virtMachine.m_numInstructionsPerformed  >= VirtualMachineComponent.MAX_INSTRUCTIONS_CAN_BE_PERFORMED) {
        console.log('Infinite loop !');
      }
      // perform current instruction
      const indexInstr = instr.m_instruction;
      const funcCall = virtMachine.m_backends[indexInstr];
      if (virtMachine.m_strErr.length !== 0) {
        console.log(`Error during runtime = ${virtMachine.m_strErr}`);
      }
      expect(funcCall !== null).toEqual(true);
      if (funcCall !== null) {
        funcCall(instr);
        virtMachine.m_curInstructionIndex++;
        if ((virtMachine.m_curInstructionIndex === numInstructions) && (!virtMachine.m_codeFinished)) {
          virtMachine.m_codeFinished = true;
          // s_winConsole.addString("Code completed");
          // _addVmDataArrayToConsole();
        }
      }

    } // while not code end
    */
  }); // of it

});
