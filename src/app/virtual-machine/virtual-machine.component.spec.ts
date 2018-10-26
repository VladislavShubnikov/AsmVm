import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { VirtualMachineComponent } from './virtual-machine.component';
import { InstrSetComponent } from '../instrset/instrset.component';
import { RegistersComponent } from '../registers/registers.component';
import { MemoryViewerComponent } from '../memoryviewer/memoryviewer.component';
import { ConsoleComponent } from '../console/console.component';

import { LexemType } from '../core/lexemtype';
import { Compiler } from '../core/compiler';
import { Register } from '../core/register';
import { Preprocessor } from '../core/preprocessor';
import { OperandType } from '../core/operandtype';
import { TestSingle, TestDescr } from '../core/testdescr';

// import * as TestCodeArr from '../../assets/test.json';

describe('VirtualMachineComponent', () => {
  let virtMachine: VirtualMachineComponent;
  let fixture: ComponentFixture<VirtualMachineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ VirtualMachineComponent, InstrSetComponent,
        RegistersComponent, MemoryViewerComponent, ConsoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualMachineComponent);
    virtMachine = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('perform wrong instruction mnemiic', () => {
    let codeAll = 'Hello, world';
    // console.log(`Perform compile for code = ${codeAll}`);
    const compiler = new Compiler();
    const preprocessor = new Preprocessor();
    const strWoLabels = preprocessor.replaceLabelsToInts(codeAll);
    // console.log(`strWoLabels = ${strWoLabels}`);
    expect(strWoLabels.length).toEqual(0);
    expect(preprocessor.m_strErr.length !== 0).toEqual(true);

    codeAll = 'Hello: world';
    const str2WoLabel = preprocessor.replaceLabelsToInts(codeAll);
    expect(strWoLabels.length).toEqual(0);
    expect(preprocessor.m_strErr.length !== 0).toEqual(true);
    // console.log(preprocessor.m_strErr);

    codeAll = 'Hello';
    const str3WoLabel = preprocessor.replaceLabelsToInts(codeAll);
    expect(str3WoLabel.length).toEqual(0);
    expect(preprocessor.m_strErr.length !== 0).toEqual(true);

    codeAll = 'Hello:';
    const str4WoLabel = preprocessor.replaceLabelsToInts(codeAll);
    // console.log(`str4WoLabel = ${str4WoLabel}`);
    const LABEL_CODE_LEN = 2;
    expect(str4WoLabel.length).toEqual(LABEL_CODE_LEN);
    const CODE_GEN = '0:';
    expect(str4WoLabel).toEqual(CODE_GEN);
    expect(preprocessor.m_strErr.length === 0).toEqual(true);

    const setInstr = new InstrSetComponent();
    let errCompile;

    codeAll = 'nop';
    errCompile = compiler.createCode(codeAll, setInstr);
    expect(errCompile).toEqual(true);
    if (!errCompile) {
      console.log(`Unexpected compile error = ${compiler.m_strErr}`);
    }

    codeAll = 'LabelHello:\nnop';
    errCompile = compiler.createCode(codeAll, setInstr);
    expect(errCompile).toEqual(true);
    if (!errCompile) {
      console.log(`Unexpected compile error = ${compiler.m_strErr}`);
    }

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

    virtMachine.invokeInstruction(instr0);
    virtMachine.invokeInstruction(instr1);
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
    const INVALID = -1;
    expect(numInstructions).toEqual(NUM_INSTR_3);
    while (virtMachine.m_curInstructionIndex < numInstructions) {
      const instr = setInstr.m_instructions[virtMachine.m_curInstructionIndex];
      const retInstr = virtMachine.invokeInstruction(instr);
      expect(retInstr).toEqual(INVALID);
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
    const INVALID = -1;
    expect(numInstructions).toEqual(NUM_INSTR_3);
    while (virtMachine.m_curInstructionIndex < numInstructions) {
      const instr = setInstr.m_instructions[virtMachine.m_curInstructionIndex];
      const retInstr = virtMachine.invokeInstruction(instr);
      expect(retInstr).toEqual(INVALID);
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

  it('perform test read dword from memory', () => {
    const codeAll = 'add EAX, DWORD PTR [ESI + ECX*4 - 4]';
    const compiler = new Compiler();
    const setInstr = new InstrSetComponent();
    const errCompile = compiler.createCode(codeAll, setInstr);
    expect(errCompile).toEqual(true);
    if (!errCompile) {
      console.log(`Unexpected compile error = ${ compiler.m_strErr}`);
    }
    virtMachine.setupInstructionSet(setInstr);
    const numInstructions = setInstr.m_instructions.length;
    expect(numInstructions).toEqual(1);

    // init mem and regs
    const TEST_DWORD = 17;
    const VAL_3 = 3;
    const DWORD_SIZE = 4;
    const INVALID = -1;
    virtMachine.m_registers[Register.REG_EAX] = 0;
    virtMachine.m_registers[Register.REG_ESI] = 0;
    virtMachine.m_registers[Register.REG_ECX] = VAL_3;
    virtMachine.putDwordToMemory(VAL_3 * DWORD_SIZE - DWORD_SIZE, TEST_DWORD);

    const instr = setInstr.m_instructions[virtMachine.m_curInstructionIndex];
    const opSrc = instr.m_operandSrc;
    const opType = opSrc.m_operandType;
    expect(opType).toEqual(OperandType.OPERAND_MEMORY);
    const memDesc = opSrc.m_memoryDesc;
    const fRegBase = memDesc.m_flagRegBase;
    const fRegIndex = memDesc.m_flagRegIndex;
    const fImmScale = memDesc.m_flagImmScale;
    const fImmAdd = memDesc.m_flagImmAdd;
    // console.log(`Flags = ${fRegBase}, ${fRegIndex}, ${fImmScale}, ${fImmAdd}`);
    const regBase = memDesc.m_registerBase;
    const regIndex = memDesc.m_registerIndex;
    const immScale = memDesc.m_immScale;
    const immAdd = memDesc.m_immAdd;
    // console.log(`MemRegs = ${regBase}, ${regIndex}, ${immScale}, ${immAdd}`);
    expect(regBase).toEqual(Register.REG_ESI);
    expect(regIndex).toEqual(Register.REG_ECX);
    expect(immScale).toEqual(DWORD_SIZE);
    expect(immAdd).toEqual(-DWORD_SIZE);

    const nextInstrIndex = virtMachine.invokeInstruction(instr);
    expect(nextInstrIndex === INVALID).toEqual(true);
    const regEAX = virtMachine.m_registers[Register.REG_EAX];
    // console.log(`regEAX = ${regEAX}`);
    expect(regEAX === TEST_DWORD).toEqual(true);
    expect(virtMachine.m_strErr.length === 0).toEqual(true);
  });

  it('perform test with simple loop (calculate sum of 3 dwords)', () => {
    const codeArr = [
      '  xor EAX, EAX',
      'labelAgain :',
      '  add EAX, DWORD PTR [ESI + ECX*4 - 4]',
      '  dec ECX',
      '  jnz labelAgain'
    ];
    let codeAll = '';
    for (let i = 0; i < codeArr.length; i++) {
      codeAll += codeArr[i];
      if (i < codeArr.length - 1) {
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
    const NUM_INSTR = 5;
    const INVALID = -1;
    expect(numInstructions).toEqual(NUM_INSTR);
    // prepare data before code run
    const NUM_ITERS = 3;
    virtMachine.m_registers[Register.REG_ECX] = NUM_ITERS;
    const OFF_DATA_8 = 4;
    const DWORD_TEST_0 = 17;
    virtMachine.putDwordToMemory(OFF_DATA_8, DWORD_TEST_0);
    const readedDword = virtMachine.getDwordFromMemory(OFF_DATA_8);
    expect(readedDword).toEqual(DWORD_TEST_0);

    const OFF_0 = 0;
    const OFF_1 = 1;
    const OFF_2 = 2;
    const DWORD_SIZE = 4;

    const DWORD_TEST_1 = 78;
    const DWORD_TEST_2 = 195;
    virtMachine.putDwordToMemory(OFF_0 * DWORD_SIZE, DWORD_TEST_0);
    virtMachine.putDwordToMemory(OFF_1 * DWORD_SIZE, DWORD_TEST_1);
    virtMachine.putDwordToMemory(OFF_2 * DWORD_SIZE, DWORD_TEST_2);

    while (virtMachine.m_curInstructionIndex < numInstructions) {
      const instr = setInstr.m_instructions[virtMachine.m_curInstructionIndex];
      // is this nop instruction
      if (instr.m_instruction === LexemType.LEXEM_OP_NOP) {
        virtMachine.m_curInstructionIndex++;
        if ((virtMachine.m_curInstructionIndex === numInstructions) && (!virtMachine.m_codeFinished)) {
          virtMachine.m_codeFinished = true;
        }
        continue;
      }
      const indexInstructionAfterJmp = virtMachine.invokeInstruction(instr);
      // debug
      // const strInstr = instr.getString();
      // const strEAX = virtMachine.m_registers[Register.REG_EAX];
      // const strECX = virtMachine.m_registers[Register.REG_ECX];
      // const strESI = virtMachine.m_registers[Register.REG_ESI];
      // console.log(`Instr performed: ${strInstr}. EAX = ${strEAX}, ECX = ${strECX}, ESI = ${strESI}`);
      if (indexInstructionAfterJmp >= 0) {
        virtMachine.m_curInstructionIndex = indexInstructionAfterJmp;
      } else {
        virtMachine.m_curInstructionIndex++;
      }
      // check end of code
      if ((virtMachine.m_curInstructionIndex === numInstructions) && (!virtMachine.m_codeFinished)) {
        virtMachine.m_codeFinished = true;
      }
    } // while instructions
    expect(virtMachine.m_codeFinished).toEqual(true);
    const regEAX = virtMachine.m_registers[Register.REG_EAX];
    // console.log(`regEAX (sum) = ${regEAX}`);
    // 17 + 78 + 195 === 290
    const SUM = DWORD_TEST_0 + DWORD_TEST_1 + DWORD_TEST_2;
    expect(regEAX === SUM).toEqual(true);
  });

  it('perform loop fibonachi sum', () => {
    const codeArr = [
      'LabelAgain:',
      '  mov EAX, EDX',
      '  add EDX, EBX',
      '  mov EBX, EAX',
      '  dec ECX',
      '  jnz LabelAgain',
      '  mov EAX, EDX'
    ];
    let codeAll = '';
    for (let i = 0; i < codeArr.length; i++) {
      codeAll += codeArr[i];
      if (i < codeArr.length - 1) {
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
    const NUM_INSTR = 7;
    const INVALID = -1;
    expect(numInstructions).toEqual(NUM_INSTR);
    // prepare data before code run
    const NUM_2 = 2;
    const NUM_3 = 3;
    const NUM_ITERS = 4;
    virtMachine.m_registers[Register.REG_EBX] = NUM_2;
    virtMachine.m_registers[Register.REG_EDX] = NUM_3;
    virtMachine.m_registers[Register.REG_ECX] = NUM_ITERS;

    while (virtMachine.m_curInstructionIndex < numInstructions) {
      virtMachine.performInstruction();
      if (virtMachine.m_strErr.length !== 0) {
        console.log(`Test. Error during VM execution = ${virtMachine.m_strErr}`);
      }
    } // while instructions
    expect(virtMachine.m_codeFinished).toEqual(true);
    const regEAX = virtMachine.m_registers[Register.REG_EAX];
    // console.log(`regEAX (sum) = ${regEAX}`);
    // 2, 3, 5, 8, 13, 21
    const SUM_FIBO = 21;
    expect(regEAX === SUM_FIBO).toEqual(true);
  });

  it('perform test push/pop', () => {
    const codeArr = [
      'mov EAX, 12',
      'push EAX',
      'push 77',
      'pop EBX',
      'pop ECX'
    ];
    let codeAll = '';
    for (let i = 0; i < codeArr.length; i++) {
      codeAll += codeArr[i];
      if (i < codeArr.length - 1) {
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
    const NUM_INSTR = 5;
    const INVALID = -1;
    expect(numInstructions).toEqual(NUM_INSTR);
    // prepare data before code run
    // run code
    while (virtMachine.m_curInstructionIndex < numInstructions) {
      virtMachine.performInstruction();
      if (virtMachine.m_strErr.length !== 0) {
        console.log(`Test. Error during VM execution = ${virtMachine.m_strErr}`);
      }
    } // while instructions
    expect(virtMachine.m_codeFinished).toEqual(true);
    const regEAX = virtMachine.m_registers[Register.REG_EAX];
    const regEBX = virtMachine.m_registers[Register.REG_EBX];
    const regECX = virtMachine.m_registers[Register.REG_ECX];
    // console.log(`regEAX (sum) = ${regEAX}`);
    const NUM_12 = 12;
    const NUM_77 = 77;
    expect(regEAX === NUM_12).toEqual(true);
    expect(regEBX === NUM_77).toEqual(true);
    expect(regECX === NUM_12).toEqual(true);
  });

  /*
  it('perform read from json file', () => {
    console.log('VM. Test read json. Start...');
    const vm = virtMachine;
    vm.loadJson().subscribe(data => {
      const arr = data.tests;
      const numElems = arr.length;
      console.log(`VM. Test from json read. num tests = ${numElems}`);
    },
    err => {
      console.log(`VM. Test Read Json error = ${err}`);
    });
    const tst = vm.m_codeTests;
    console.log(`VM. Test read json. tst = ${tst}`);
    const numTests = tst.length;
    console.log(`Test read JSON file. numTests = ${numTests}`);
    console.log(`Test read JSON file. test[0].code = ${tst[0].code}`);

    const compiler = new Compiler();
    const setInstr = new InstrSetComponent();

    for (let i = 0; i < numTests; i++) {
      const codeStr = tst[i].code;
      const resEAX = tst[i].resEAX;
      console.log(`test code [${i}] = ${codeStr}. resEAX = ${resEAX}`);
      const errCompile = compiler.createCode(codeStr, setInstr);
      expect(errCompile).toEqual(true);
      if (!errCompile) {
        console.log(`Unexpected compile error = ${ compiler.m_strErr}`);
      }

      vm.setupInstructionSet(setInstr);
      const numInstructions = setInstr.m_instructions.length;
      console.log(`Num instructions for test [${i}] = ${numInstructions}`);
      // perform all instr
      while (vm.m_curInstructionIndex < numInstructions) {
        const instr = setInstr.m_instructions[vm.m_curInstructionIndex];
        const retInstr = vm.invokeInstruction(instr);
        expect(retInstr).toEqual(1);
        vm.m_curInstructionIndex++;
        if ((vm.m_curInstructionIndex === numInstructions) && (!vm.m_codeFinished)) {
          vm.m_codeFinished = true;
        }
      } // while
      expect(vm.m_codeFinished).toEqual(true);
      const regEAX = vm.m_registers[Register.REG_EAX];
      expect(regEAX === resEAX).toEqual(true);
      console.log(`Test read json code [${i}] and run. regEAX = {regEAX}`);
    } // for all tests from file

  });
  */

});
