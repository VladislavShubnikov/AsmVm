// ********************************************************
// Imports
// ********************************************************

import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { TestSingle, TestDescr } from '../core/testdescr';
import { Register } from '../core/register';
import { RegFlags } from '../core/regflags';
import { OperandType } from '../core/operandtype';
import { LexemType } from '../core/lexemtype';
import { LexemParser } from '../core/lexemparser';
import { RandomComponent } from '../random/random.component';
import { InstructionComponent } from '../instruction/instruction.component';
import { InstrSetComponent } from '../instrset/instrset.component';
import { RegistersComponent } from '../registers/registers.component';
import { MemoryViewerComponent } from '../memoryviewer/memoryviewer.component';
import { ConsoleComponent } from '../console/console.component';
import { RegflagsComponent } from '../regflags/regflags.component';
// import { TestService } from '../services/testservice';

// ********************************************************
// Consts
// ********************************************************


const KBYTE = 1024;
const TWO = 2;
const NUM_64 = 64;
const FAIL = -1;

const MAX_EMULATOR_DATA_SIZE = (KBYTE * NUM_64);
const MAX_EMULATOR_STACK_SIZE = (KBYTE * TWO);
const MAX_INSTRUCTIONS_CAN_BE_PERFORMED = 16000;

const CODE_NUM_ITERATIONS = 3;


type BackendCallback = (instr: InstructionComponent) => number;

// component description (decorator) shoul be declared just before
// export section
@Component({
  selector: 'app-virtual-machine',
  templateUrl: './virtual-machine.component.html',
  styleUrls: ['./virtual-machine.component.css']
})

// **********************************************************

export class VirtualMachineComponent implements OnInit {

  // ********************************************************
  // Const
  // ********************************************************

  static readonly MAX_EMULATOR_DATA_SIZE = (KBYTE * NUM_64);
  static readonly MAX_EMULATOR_STACK_SIZE = (KBYTE * TWO);
  static readonly MAX_INSTRUCTIONS_CAN_BE_PERFORMED = 16000;

  // ********************************************************
  // Data
  // ********************************************************

  // string data for visualize
  m_strTitle: string;
  m_strRun: string;
  m_strStep: string;

  m_registers: number[];
  m_regFlags: number;
  // each element is byte: [0..255]
  m_data: number[];
  m_instrSet: InstrSetComponent;
  m_curInstructionIndex: number;
  m_strErr: string;

  m_backends: BackendCallback[];

  m_codeTests: TestSingle[];
  // m_service: TestService;

  // run state
  m_isRunning: boolean;
  m_numPerformedInstructions: number;
  m_codeFinished: boolean;
  m_numInstructionsPerformed: number;

  // ******************************
  // Child components
  // ******************************
  @ViewChild(InstrSetComponent)
  m_instrSetChild: InstrSetComponent;

  @ViewChild(RegistersComponent)
  m_registersChild: RegistersComponent;

  @ViewChild(MemoryViewerComponent)
  m_memoryViewerChild: MemoryViewerComponent;

  @ViewChild(ConsoleComponent)
  m_consoleChild: ConsoleComponent;

  @ViewChild(RegflagsComponent)
  m_regFlagsChild: RegflagsComponent;

  // ********************************************************
  // Methods
  // ********************************************************

  public loadJson() {
    const RESOURCE_NAME = './assets/test.json';
    const strm = this.http.get<TestDescr>(RESOURCE_NAME);
    // console.log('VM. loadJson invoked');
    return strm;
  }

  ngOnInit() {
    this.loadJson().subscribe(data => {
      // const strDump = JSON.stringify(data);
      // console.log(`VM. ngOnInit. data = ${strDump}`);
      const arr = data.tests;
      const numElems = arr.length;
      this.m_codeTests = arr;
      console.log(`VM. ngOnInit. Read json. numElems = ${numElems}`);

      // get 0-th test example from json test file
      const codeToCompile = arr[0].code;
      // assign to instruction set component
      this.m_instrSetChild.compileFromSource(codeToCompile);

      // init registers
      this.m_registers[Register.REG_ECX] = CODE_NUM_ITERATIONS;
      this.m_registers[Register.REG_ESI] = 0;

      // assign registers
      for (let i = 0; i < Register.REG_COUNT; i++) {
        this.m_registersChild.setIndividualRegisterValue(i, this.m_registers[i]);
      }
      // assign instruction set
      this.setupInstructionSet(this.m_instrSetChild);

      // assign memory
      const DATA_SZ_ALL = VirtualMachineComponent.MAX_EMULATOR_DATA_SIZE +
        VirtualMachineComponent.MAX_EMULATOR_STACK_SIZE;
      this.m_memoryViewerChild.setData(this.m_data, DATA_SZ_ALL);
    },
    err => {
      console.log(`VM. ngOnInit. Read Json error = ${err}`);
    });
    // test set regflags
    // tslint:disable-next-line:no-bitwise
    // const FLAGS = RegFlags.FLAG_PARITY | RegFlags.FLAG_ZERO | RegFlags.FLAG_SIGN;
    // this.m_regFlagsChild.setFlags(FLAGS);
  }

  setSourceCode(strCode: string) {
    // console.log(`VM. setSourceCode = ${strCode}`);
    // assign to instruction set component
    this.m_instrSetChild.compileFromSource(strCode);
    // init registers
    this.m_registers[Register.REG_ECX] = CODE_NUM_ITERATIONS;
    this.m_registers[Register.REG_ESI] = 0;

    // assign registers
    for (let i = 0; i < Register.REG_COUNT; i++) {
      this.m_registersChild.setIndividualRegisterValue(i, this.m_registers[i]);
    }
    // assign instruction set
    this.setupInstructionSet(this.m_instrSetChild);

    // assign memory
    const DATA_SZ_ALL = VirtualMachineComponent.MAX_EMULATOR_DATA_SIZE +
      VirtualMachineComponent.MAX_EMULATOR_STACK_SIZE;
    this.m_memoryViewerChild.setData(this.m_data, DATA_SZ_ALL);
  }

  constructor(private http: HttpClient) {

    this.m_strTitle = 'Виртуальная машина ассемблера';
    this.m_strRun = 'Играть';
    this.m_strStep = 'Шаг  ';
    this.m_isRunning = false;
    this.m_numPerformedInstructions = 0;

    // init code tests with some trash data
    this.m_codeTests = new Array(1);
    const ID = 55;
    const RES = 555;
    this.m_codeTests[0] = {id: ID, descr: 'Some descr', code: 'Here code', resEAX: RES};

    this.m_curInstructionIndex = 0;
    this.m_codeFinished = false;
    this.m_numInstructionsPerformed = 0;
    let i;
    this.m_registers = new Array(Register.REG_COUNT);
    for (i = 0; i < Register.REG_COUNT; i++) {
      this.m_registers[i] = 0;
    }
    this.m_regFlags = 0;
    const rnd = new RandomComponent();
    rnd.initRandomSeed();
    const DATA_SZ_ALL = VirtualMachineComponent.MAX_EMULATOR_DATA_SIZE +
      VirtualMachineComponent.MAX_EMULATOR_STACK_SIZE;
    this.m_data = new Array(DATA_SZ_ALL);
    const MAX_BYTE_VAL = 255;
    const MASK_THREE = 3;
    for (i = 0; i < DATA_SZ_ALL; i++) {
      // tslint:disable-next-line:no-bitwise
      if ((i & MASK_THREE) === 0) {
        // tslint:disable-next-line:no-bitwise
        const s = rnd.getNextRandomInt() & MAX_BYTE_VAL;
        this.m_data[i] = s;
      } else {
        this.m_data[i] = 0;
      }
    }
    // init esp register to max possible stack value
    this.m_registers[Register.REG_ESP] = DATA_SZ_ALL;
    this.m_instrSet = null;
    // error message
    this.m_strErr = '';

    // setup back ends
    this.m_backends = new Array(LexemType.LEXEM_OP_LAST);
    for (i = 0; i < LexemType.LEXEM_OP_LAST; i++) {
      this.m_backends[i] = null;
    }
    this.m_backends[LexemType.LEXEM_OP_XOR] = this.instrXor;
    this.m_backends[LexemType.LEXEM_OP_AND] = this.instrAnd;
    this.m_backends[LexemType.LEXEM_OP_OR] = this.instrOr;
    this.m_backends[LexemType.LEXEM_OP_SUB] = this.instrSub;
    this.m_backends[LexemType.LEXEM_OP_MUL] = this.instrMul;
    this.m_backends[LexemType.LEXEM_OP_DIV] = this.instrDiv;
    this.m_backends[LexemType.LEXEM_OP_MOV] = this.instrMov;
  }
  private prepareToStartRunOrFirstStep() {
    // prepare registers
    this.m_registers[Register.REG_ECX] = CODE_NUM_ITERATIONS;
    this.m_registers[Register.REG_ESI] = 0;

    // prepare to start running step-by-step
    this.m_isRunning = true;
    this.m_numPerformedInstructions = 0;
    this.m_curInstructionIndex = 0;
    this.m_codeFinished = false;
  }

  public onClickButtonRun() {
    if (this.m_isRunning) {
      console.log('onClickButtonRun: already running');
      return;
    }
    // console.log('onClickButtonRun');
    this.prepareToStartRunOrFirstStep();
    this.m_consoleChild.clear();
    const numInstructionsInSet = this.m_instrSet.m_instructions.length;
    const strMsg = `Старт выполнения ${numInstructionsInSet} инструкций...`;
    this.m_consoleChild.addString(strMsg);

    const TIME_DELAY = 400;
    const timerObj = setInterval( () => {
      // perform one sigle step of current instruction execution
      this.performInstruction();
      if (this.m_strErr.length !== 0) {
        this.m_codeFinished = true;
      }
      if (this.m_codeFinished) {
        clearInterval(timerObj);
        // update visual repr
        if (this.m_strErr.length !== 0) {
          this.m_isRunning = false;
          this.m_codeFinished = true;
          const strMsgErr = `ВМ. Ошибка выполнения = ${this.m_strErr}`;
          this.m_consoleChild.addString(strMsgErr);
          console.log(strMsg);
          return;
        }
        if (this.m_curInstructionIndex >= numInstructionsInSet) {
          this.m_isRunning = false;
          this.m_codeFinished = true;
          const strMsg1 = `ВМ. Выполнено ${this.m_numPerformedInstructions} инструкций кода`;
          this.m_consoleChild.addString(strMsg1);
          console.log(strMsg1);
          const strMsg2 = `ВМ. Исходных ${numInstructionsInSet} инструкций`;
          this.m_consoleChild.addString(strMsg2);
          console.log(strMsg2);
        } // if finish iunstr set
      } else {
        // update visuals: isntr set

        // this.m_instrSetChild.m_currentLine = this.m_curInstructionIndex;
        this.m_instrSetChild.setCurrentLine(this.m_curInstructionIndex);

        // update visuals: registers
        for (let i = 0; i < Register.REG_COUNT; i++) {
          this.m_registersChild.setIndividualRegisterValue(i, this.m_registers[i]);
        } // for i all registers
      } // if code not finished
    }, TIME_DELAY);

    /*
    */
  }

  public onClickButtonStep() {
    // console.log('onClickButtonStep');
    const numInstructionsInSet = this.m_instrSet.m_instructions.length;
    if (!this.m_isRunning) {
      this.prepareToStartRunOrFirstStep();
      this.m_consoleChild.clear();
      const strMsg = `Старт выполнения ${numInstructionsInSet} инструкций...`;
      this.m_consoleChild.addString(strMsg);
    }

    this.performInstruction();
    if (this.m_strErr.length !== 0) {
      this.m_isRunning = false;
      this.m_codeFinished = true;
      const strMsg = `ВМ. Ошибка выполнения = ${this.m_strErr}`;
      this.m_consoleChild.addString(strMsg);
      console.log(strMsg);
      return;
    }
    if (this.m_curInstructionIndex >= numInstructionsInSet) {
      this.m_isRunning = false;
      this.m_codeFinished = true;
      const strMsg1 = `ВМ. Выполнено ${this.m_numPerformedInstructions} инструкций кода`;
      this.m_consoleChild.addString(strMsg1);
      console.log(strMsg1);
      const strMsg2 = `ВМ. Исходных ${numInstructionsInSet} инструкций`;
      this.m_consoleChild.addString(strMsg2);
      console.log(strMsg2);
    }
    // update visuals: instr set
    // this.m_instrSetChild.m_currentLine = this.m_curInstructionIndex;
    this.m_instrSetChild.setCurrentLine(this.m_curInstructionIndex);

    // update visuals: registers
    for (let i = 0; i < Register.REG_COUNT; i++) {
      this.m_registersChild.setIndividualRegisterValue(i, this.m_registers[i]);
    }
  }

  getInstructionIndexByLabel(labelNumber) {
    const instrSet = this.m_instrSet.m_instructions;
    const numInstructions = instrSet.length;
    for (let i = 0; i < numInstructions; i++) {
      const instr = instrSet[i];
      if (instr.m_labelCode === labelNumber) {
        return i;
      }
    } // for (i)
    return FAIL;
  }

  /**
  * return: -1, if bad
  */
  public getDataFromOperand(operand) {
    const FOUR = 4;
    if (operand.m_operandType === OperandType.OPERAND_IMMEDIATE_INT) {
      return operand.m_immediateInt;
    } else if (operand.m_operandType === OperandType.OPERAND_REGISTER) {
      const indexReg = operand.m_register;
      if (indexReg < 0) {
        console.log(`Backend. getDataFromOperand. Bad Register index = ${indexReg}`);
        this.m_strErr = `Backend. getDataFromOperand. Bad Register index = ${indexReg}`;
        return FAIL;
      }
      if (indexReg >= Register.REG_COUNT) {
        console.log(`Backend. getDataFromOperand. Bad Register index = ${indexReg}`);
        this.m_strErr = `Backend. getDataFromOperand. Bad Register index = ${indexReg}`;
        return FAIL;
      }
      if (indexReg === Register.REG_CL) {
        const BYTE_MASK = 0xff;
        /* tslint:disable-next-line */
        return (this.m_registers[Register.REG_ECX] & BYTE_MASK);
      }
      return this.m_registers[indexReg];
    } else if (operand.m_operandType === OperandType.OPERAND_MEMORY) {
      const mem = operand.m_memoryDesc;
      let offsetDataBytes = 0;
      if (mem.m_flagImmAdd) {
        offsetDataBytes += mem.m_immAdd;
      }
      if (mem.m_flagRegBase) {
        const indexReg = mem.m_registerBase;
        offsetDataBytes += this.m_registers[indexReg];
      }
      if (mem.m_flagRegIndex) {
        if (mem.m_flagImmScale) {
          const indexReg = mem.m_registerIndex;
          offsetDataBytes += this.m_registers[indexReg] * mem.m_immScale;
        } else {
          const indexReg = mem.m_registerIndex;
          offsetDataBytes += this.m_registers[indexReg];
        }
      }
      // console.log(`getDataFromMemory. offsetDataBytes = ${offsetDataBytes}`);
      if (offsetDataBytes < 0) {
        this.m_strErr = 'Runtimne error. Memory access. Index out of range';
        return FAIL;
      } else if ((offsetDataBytes / FOUR) >= VirtualMachineComponent.MAX_EMULATOR_DATA_SIZE) {
        this.m_strErr = 'Runtimne error. Memory access. Index out of range';
        return FAIL;
      } else {
        // get 32 bytes from in data array
        const SHIFT_8 = 8;
        const SHIFT_16 = 16;
        const SHIFT_24 = 24;
        const OFF_0 = 0;
        const OFF_1 = 1;
        const OFF_2 = 2;
        const OFF_3 = 3;
        const valA = this.m_data[offsetDataBytes + OFF_0];
        const valB = this.m_data[offsetDataBytes + OFF_1];
        const valC = this.m_data[offsetDataBytes + OFF_2];
        const valD = this.m_data[offsetDataBytes + OFF_3];
        /* tslint:disable-next-line */
        const val = valA + (valB << SHIFT_8) + (valC << SHIFT_16) + (valD << SHIFT_24);
        return val;
      }
      this.m_strErr = `Runtimne error. Memory access. Strange data offset value = ${offsetDataBytes}`;
      return FAIL;

    } // if operand is memory
    this.m_strErr = 'Runtimne error. Invalid operand type';
    return FAIL;
  }

  /**
  * return: true if success put operand
  */
  public putDataToOperand(operand, valDst) {
    const FOUR = 4;
    if (operand.m_operandType === OperandType.OPERAND_IMMEDIATE_INT) {
      console.log('Backend. putDataToOperand. Bad operand type OPERAND_IMMEDIATE_INT');
      return false;
    }
    if (operand.m_operandType === OperandType.OPERAND_REGISTER) {
      const indexReg = operand.m_register;
      if (indexReg < 0) {
        console.log(`Backend. getDataFromOperand. Bad Register index = ${indexReg}`);
        return false;
      }
      if (indexReg >= Register.REG_COUNT) {
        console.log(`Backend. getDataFromOperand. Bad Register index = ${indexReg}`);
        return false;
      }
      this.m_registers[indexReg] = valDst;
    } else if (operand.m_operandType === OperandType.OPERAND_MEMORY) {
      const mem = operand.m_memoryDesc;

      let offsetDataBytes = 0;
      if (mem.m_flagImmAdd) {
        offsetDataBytes += mem.m_immAdd;
      }
      if (mem.m_flagRegBase) {
        const indexReg = mem.m_registerBase;
        offsetDataBytes += this.m_registers[indexReg];
      }
      if (mem.m_flagRegIndex) {
        if (mem.m_flagImmScale) {
          const indexReg = mem.m_registerIndex;
          offsetDataBytes += this.m_registers[indexReg] * mem.m_immScale;
        } else {
          const indexReg = mem.m_registerIndex;
          offsetDataBytes += this.m_registers[indexReg];
        }
      }
      if (offsetDataBytes < 0) {
        this.m_strErr = 'Runtimne error. Memory access. Index out of range';
        return false;
      } else if ((offsetDataBytes / FOUR) >= VirtualMachineComponent.MAX_EMULATOR_DATA_SIZE) {
        this.m_strErr = 'Runtimne error. Memory access. Index out of range';
        return false;
      } else {
        // convert 4 bytes into 32 bit int
        // dwordPointer = (int*)((char*)s_virtualMachine->m_data + offsetDataBytes);
        // *dwordPointer = valDst;
        const MASK_BYTE = 0xff;
        const BITS_IN_BYTE = 8;
        let val = valDst;
        /* tslint:disable-next-line */
        const valA = val & MASK_BYTE;
        /* tslint:disable-next-line */
        val >>= BITS_IN_BYTE;
        /* tslint:disable-next-line */
        const valB = val & MASK_BYTE;
        /* tslint:disable-next-line */
        val >>= BITS_IN_BYTE;
        /* tslint:disable-next-line */
        const valC = val & MASK_BYTE;
        /* tslint:disable-next-line */
        val >>= BITS_IN_BYTE;
        /* tslint:disable-next-line */
        const valD = val & MASK_BYTE;
        const OFF_0 = 0;
        const OFF_1 = 1;
        const OFF_2 = 2;
        const OFF_3 = 3;
        this.m_data[offsetDataBytes + OFF_0] = valA;
        this.m_data[offsetDataBytes + OFF_1] = valB;
        this.m_data[offsetDataBytes + OFF_2] = valC;
        this.m_data[offsetDataBytes + OFF_3] = valD;
        // update memory in visual
        const DATA_SZ_ALL = VirtualMachineComponent.MAX_EMULATOR_DATA_SIZE +
          VirtualMachineComponent.MAX_EMULATOR_STACK_SIZE;
        this.m_memoryViewerChild.setData(this.m_data, DATA_SZ_ALL);
      }
    }
    return true;
  } // end of putDataToOperand

  public putDwordToMemory(offsetDataBytes, valSrc) {
    const MASK_BYTE = 0xff;
    const BITS_IN_BYTE = 8;
    let val = valSrc;
    /* tslint:disable-next-line */
    const valA = val & MASK_BYTE;
    /* tslint:disable-next-line */
    val >>= BITS_IN_BYTE;
    /* tslint:disable-next-line */
    const valB = val & MASK_BYTE;
    /* tslint:disable-next-line */
    val >>= BITS_IN_BYTE;
    /* tslint:disable-next-line */
    const valC = val & MASK_BYTE;
    /* tslint:disable-next-line */
    val >>= BITS_IN_BYTE;
    /* tslint:disable-next-line */
    const valD = val & MASK_BYTE;
    const OFF_0 = 0;
    const OFF_1 = 1;
    const OFF_2 = 2;
    const OFF_3 = 3;
    this.m_data[offsetDataBytes + OFF_0] = valA;
    this.m_data[offsetDataBytes + OFF_1] = valB;
    this.m_data[offsetDataBytes + OFF_2] = valC;
    this.m_data[offsetDataBytes + OFF_3] = valD;
    // update memory in visual
    const DATA_SZ_ALL = VirtualMachineComponent.MAX_EMULATOR_DATA_SIZE +
      VirtualMachineComponent.MAX_EMULATOR_STACK_SIZE;
    this.m_memoryViewerChild.setData(this.m_data, DATA_SZ_ALL);
  }
  public getDwordFromMemory(offsetDataBytes) {
    const SHIFT_8 = 8;
    const SHIFT_16 = 16;
    const SHIFT_24 = 24;
    const OFF_0 = 0;
    const OFF_1 = 1;
    const OFF_2 = 2;
    const OFF_3 = 3;
    const valA = this.m_data[offsetDataBytes + OFF_0];
    const valB = this.m_data[offsetDataBytes + OFF_1];
    const valC = this.m_data[offsetDataBytes + OFF_2];
    const valD = this.m_data[offsetDataBytes + OFF_3];
    /* tslint:disable-next-line */
    const val = valA + (valB << SHIFT_8) + (valC << SHIFT_16) + (valD << SHIFT_24);
    return val;
  }

  public static hasParity(val) {
    let i, numOnes;
    numOnes = 0;
    const NUM_BITS = 8;
    for (i = 0; i < NUM_BITS; i++) {
      // tslint:disable-next-line
      const mask = 1 << i;
      // tslint:disable-next-line
      if ((val & mask) !== 0) {
        numOnes++;
      }
    }
    /* tslint:disable-next-line */
    if ((numOnes & 1) !== 0)
      return false;
    return true;
  }

  public setupFlagsByTwo(valDst, valSrc) {
    const val = valDst - valSrc;
    // tslint:disable-next-line
    this.m_regFlags &= ~RegFlags.FLAG_CARRY;
    // tslint:disable-next-line
    this.m_regFlags &= ~RegFlags.FLAG_OVERFLOW;
    this.modifyFlags(val);

    // if ((unsigned int)valDst < (unsigned int)valSrc)
    //   s_virtualMachine->m_registerFlags |= FLAG_CARRY;
    if (valDst < valSrc) {
      // tslint:disable-next-line
      this.m_regFlags |= RegFlags.FLAG_CARRY;
    }
    this.m_regFlagsChild.setFlags(this.m_regFlags);
  }

  public modifyFlags(valDst) {
    // zero flag
    if (valDst === 0) {
      // tslint:disable-next-line
      this.m_regFlags |= RegFlags.FLAG_ZERO;
    } else {
      // tslint:disable-next-line
      this.m_regFlags &= ~RegFlags.FLAG_ZERO;
    }
    // sign flag
    if (valDst < 0) {
      // tslint:disable-next-line
      this.m_regFlags |= RegFlags.FLAG_SIGN;
    } else {
      // tslint:disable-next-line
      this.m_regFlags &= ~RegFlags.FLAG_SIGN;
    }
    if (VirtualMachineComponent.hasParity(valDst)) {
      // tslint:disable-next-line
      this.m_regFlags |= RegFlags.FLAG_PARITY;
    } else {
      // tslint:disable-next-line
      this.m_regFlags &= ~RegFlags.FLAG_PARITY;
    }
    this.m_regFlagsChild.setFlags(this.m_regFlags);
  }

  public getData() {
    return this.m_data;
  }

  public setupInstructionSet(instrSet) {
    this.m_instrSet = instrSet;
  }

  // ****************************************************************
  // Individual instructions backend's
  // ****************************************************************

  instrXor(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    let valDst = this.getDataFromOperand(opDst);
    const valSrc = this.getDataFromOperand(opSrc);
    // let valDst = _getDataFromOperand(opDst, this);
    // const valSrc = _getDataFromOperand(opSrc, this);

    /* tslint:disable-next-line */
    valDst = valDst ^ valSrc;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }
  instrAnd(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    let valDst = this.getDataFromOperand(opDst);
    const valSrc = this.getDataFromOperand(opSrc);
    /* tslint:disable-next-line */
    valDst = valDst & valSrc;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }
  instrOr(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    let valDst = this.getDataFromOperand(opDst);
    const valSrc = this.getDataFromOperand(opSrc);
    /* tslint:disable-next-line */
    valDst = valDst | valSrc;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }
  instrAdd(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    let valDst = this.getDataFromOperand(opDst);
    const valSrc = this.getDataFromOperand(opSrc);
    valDst = valDst + valSrc;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }
  instrSub(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    let valDst = this.getDataFromOperand(opDst);
    const valSrc = this.getDataFromOperand(opSrc);
    valDst = valDst - valSrc;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }
  instrMul(instr) {
    const opDst = instr.m_operandDst;
    let valDst = this.getDataFromOperand(opDst);
    const valRes = valDst * this.m_registers[Register.REG_EAX];
    const MASK_32 = 0xffffffff;
    const SHIFT_32 = 32;
    /* tslint:disable-next-line */
    valDst = valRes & MASK_32;
    this.modifyFlags(valDst);
    // this.putDataToOperand(opDst, valDst);
    this.m_registers[Register.REG_EAX] = valDst;
    /* tslint:disable-next-line */
    this.m_registers[Register.REG_EDX] = valDst >> SHIFT_32;
    return FAIL;
  }
  instrDiv(instr) {
    const BITS_32 = 32;
    const opDst = instr.m_operandDst;
    const valDst = this.getDataFromOperand(opDst);
    if (Math.floor(valDst) === 0) {
      this.m_strErr = 'Runtime error. Integer division by zero';
      return 0;
    }
    const divisorLo = this.m_registers[Register.REG_EAX];
    const divisorHi = this.m_registers[Register.REG_EDX];
    // tslint:disable-next-line
    const valDivisor = divisorLo + (divisorHi << BITS_32);

    const valRes = Math.floor(valDivisor / valDst);
    const valRest = valDivisor - valRes * valDst;
    this.modifyFlags(valRes);

    this.m_registers[Register.REG_EAX] = valRes;
    this.m_registers[Register.REG_EDX] = valRest;
    return FAIL;
  }

  instrShl(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    let valDst = this.getDataFromOperand(opDst);
    const valSrc = this.getDataFromOperand(opSrc);
    const MAX_SHIFT = 32;
    if ((valSrc < 0) || (valSrc >= MAX_SHIFT)) {
      this.m_strErr = `Runtime error. Impossible shift value = ${valSrc}`;
      return 0;
    }
    // tslint:disable-next-line
    valDst = valDst << valSrc;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }

  instrShr(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    let valDst = this.getDataFromOperand(opDst);
    const valSrc = this.getDataFromOperand(opSrc);
    const MAX_SHIFT = 32;
    if ((valSrc < 0) || (valSrc >= MAX_SHIFT)) {
      this.m_strErr = `Runtime error. Impossible shift value = ${valSrc}`;
      return 0;
    }
    // tslint:disable-next-line
    valDst = valDst >> valSrc;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }

  instrSal(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    let valDst = this.getDataFromOperand(opDst);
    const valSrc = this.getDataFromOperand(opSrc);
    const MAX_SHIFT = 32;
    if ((valSrc < 0) || (valSrc >= MAX_SHIFT)) {
      this.m_strErr = `Runtime error. Impossible shift value = ${valSrc}`;
      return 0;
    }
    // tslint:disable-next-line
    valDst = valDst << valSrc;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }

  instrSar(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    let valDst = this.getDataFromOperand(opDst);
    const valSrc = this.getDataFromOperand(opSrc);
    const MAX_SHIFT = 32;
    if ((valSrc < 0) || (valSrc >= MAX_SHIFT)) {
      this.m_strErr = `Runtime error. Impossible shift value = ${valSrc}`;
      return 0;
    }
    // tslint:disable-next-line
    valDst = valDst >> valSrc;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }

  instrDec(instr) {
    const opDst = instr.m_operandDst;
    let valDst = this.getDataFromOperand(opDst);
    valDst--;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }

  instrInc(instr) {
    const opDst = instr.m_operandDst;
    let valDst = this.getDataFromOperand(opDst);
    valDst++;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }

  instrNot(instr) {
    const opDst = instr.m_operandDst;
    let valDst = this.getDataFromOperand(opDst);
    // tslint:disable-next-line
    valDst = ~valDst;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }

  instrNeg(instr) {
    const opDst = instr.m_operandDst;
    let valDst = this.getDataFromOperand(opDst);
    valDst = 0 - valDst;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }

  instrMov(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    const valSrc = this.getDataFromOperand(opSrc);
    const valDst = valSrc;
    this.putDataToOperand(opDst, valDst);
    return FAIL;
  }

  instrJmp(instr) {
    const opDst = instr.m_operandDst;
    const labelNumber = opDst.m_immediateInt;
    const indexInstr = this.getInstructionIndexByLabel(labelNumber);
    return indexInstr;
  }

  instrJnz(instr) {
    const opDst = instr.m_operandDst;
    // tslint:disable-next-line
    if ((this.m_regFlags & RegFlags.FLAG_ZERO) === 0) {
      const labelNumber = opDst.m_immediateInt;
      const indexInstr = this.getInstructionIndexByLabel(labelNumber);
      return indexInstr;
    }
    return FAIL;
  }

  instrJz(instr) {
    const opDst = instr.m_operandDst;
    // tslint:disable-next-line
    if ((this.m_regFlags & RegFlags.FLAG_ZERO) !== 0) {
      const labelNumber = opDst.m_immediateInt;
      const indexInstr = this.getInstructionIndexByLabel(labelNumber);
      return indexInstr;
    }
    return FAIL;
  }

  instrJs(instr) {
    const opDst = instr.m_operandDst;
    // tslint:disable-next-line
    if ((this.m_regFlags & RegFlags.FLAG_SIGN) !== 0) {
      const labelNumber = opDst.m_immediateInt;
      const indexInstr = this.getInstructionIndexByLabel(labelNumber);
      return indexInstr;
    }
    return FAIL;
  }

  instrJns(instr) {
    const opDst = instr.m_operandDst;
    // tslint:disable-next-line
    if ((this.m_regFlags & RegFlags.FLAG_SIGN) === 0) {
      const labelNumber = opDst.m_immediateInt;
      const indexInstr = this.getInstructionIndexByLabel(labelNumber);
      return indexInstr;
    }
    return FAIL;
  }

  instrJge(instr) {
    const opDst = instr.m_operandDst;
    // tslint:disable-next-line
    const flagSign = ((this.m_regFlags & RegFlags.FLAG_SIGN) !== 0);
    // tslint:disable-next-line
    const flagOver = ((this.m_regFlags & RegFlags.FLAG_OVERFLOW) !== 0);
    if (flagSign === flagOver) {
      const labelNumber = opDst.m_immediateInt;
      const indexInstr = this.getInstructionIndexByLabel(labelNumber);
      return indexInstr;
    }
    return FAIL;
  }

  instrJl(instr) {
    const opDst = instr.m_operandDst;
    // tslint:disable-next-line
    const flagSign = ((this.m_regFlags & RegFlags.FLAG_SIGN) !== 0);
    // tslint:disable-next-line
    const flagOver = ((this.m_regFlags & RegFlags.FLAG_OVERFLOW) !== 0);
    if (flagSign !== flagOver) {
      const labelNumber = opDst.m_immediateInt;
      const indexInstr = this.getInstructionIndexByLabel(labelNumber);
      return indexInstr;
    }
    return FAIL;
  }

  instrJle(instr) {
    const opDst = instr.m_operandDst;
    // tslint:disable-next-line
    const flagSign = ((this.m_regFlags & RegFlags.FLAG_SIGN) !== 0);
    // tslint:disable-next-line
    const flagOver = ((this.m_regFlags & RegFlags.FLAG_OVERFLOW) !== 0);
    // tslint:disable-next-line
    const flagZero = ((this.m_regFlags & RegFlags.FLAG_ZERO) !== 0);
    if (flagZero || (flagSign !== flagOver)) {
      const labelNumber = opDst.m_immediateInt;
      const indexInstr = this.getInstructionIndexByLabel(labelNumber);
      return indexInstr;
    }
    return FAIL;
  }

  instrJg(instr) {
    const opDst = instr.m_operandDst;
    // tslint:disable-next-line
    const flagSign = ((this.m_regFlags & RegFlags.FLAG_SIGN) !== 0);
    // tslint:disable-next-line
    const flagOver = ((this.m_regFlags & RegFlags.FLAG_OVERFLOW) !== 0);
    // tslint:disable-next-line
    const flagZero = ((this.m_regFlags & RegFlags.FLAG_ZERO) !== 0);
    if (!flagZero && (flagSign === flagOver)) {
      const labelNumber = opDst.m_immediateInt;
      const indexInstr = this.getInstructionIndexByLabel(labelNumber);
      return indexInstr;
    }
    return FAIL;
  }

  instrJb(instr) {
    const opDst = instr.m_operandDst;
    // tslint:disable-next-line
    const flagCarry = ((this.m_regFlags & RegFlags.FLAG_CARRY) !== 0);
    if (flagCarry) {
      const labelNumber = opDst.m_immediateInt;
      const indexInstr = this.getInstructionIndexByLabel(labelNumber);
      return indexInstr;
    }
    return FAIL;
  }

  instrJnb(instr) {
    const opDst = instr.m_operandDst;
    // tslint:disable-next-line
    const flagCarry = ((this.m_regFlags & RegFlags.FLAG_CARRY) !== 0);
    if (!flagCarry) {
      const labelNumber = opDst.m_immediateInt;
      const indexInstr = this.getInstructionIndexByLabel(labelNumber);
      return indexInstr;
    }
    return FAIL;
  }

  instrJbe(instr) {
    const opDst = instr.m_operandDst;
    // tslint:disable-next-line
    const flagCarry = ((this.m_regFlags & RegFlags.FLAG_CARRY) !== 0);
    // tslint:disable-next-line
    const flagZero = ((this.m_regFlags & RegFlags.FLAG_ZERO) !== 0);
    if (flagCarry || flagZero) {
      const labelNumber = opDst.m_immediateInt;
      const indexInstr = this.getInstructionIndexByLabel(labelNumber);
      return indexInstr;
    }
    return FAIL;
  }

  instrJa(instr) {
    const opDst = instr.m_operandDst;
    // tslint:disable-next-line
    const flagCarry = ((this.m_regFlags & RegFlags.FLAG_CARRY) !== 0);
    // tslint:disable-next-line
    const flagZero = ((this.m_regFlags & RegFlags.FLAG_ZERO) !== 0);
    if (!flagCarry && !flagZero) {
      const labelNumber = opDst.m_immediateInt;
      const indexInstr = this.getInstructionIndexByLabel(labelNumber);
      return indexInstr;
    }
    return FAIL;
  }

  instrCmp(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    const valDst = this.getDataFromOperand(opDst);
    const valSrc = this.getDataFromOperand(opSrc);
    // console.log(`instrCmp. ${valDst} VS ${valSrc}`);
    this.setupFlagsByTwo(valDst, valSrc);
    return FAIL;
  }

  instrPush(instr) {
    // subtract 4 from ESP if push dword
    // data array contains data, and stack after.
    const DWORD_SIZE = 4;
    if (this.m_registers[Register.REG_ESP] <= VirtualMachineComponent.MAX_EMULATOR_DATA_SIZE + DWORD_SIZE) {
      this.m_strErr = 'Stack overflow';
      return FAIL;
    }
    this.m_registers[Register.REG_ESP] -= DWORD_SIZE;
    const opDst = instr.m_operandDst;
    const valDst = this.getDataFromOperand(opDst);
    const offBytes = this.m_registers[Register.REG_ESP];
    this.putDwordToMemory(offBytes, valDst);
    return FAIL;
  }

  instrPop(instr) {
    // add 4 from ESP if pop dword
    // stack is placed in data array after data itself
    const MAX_STA = VirtualMachineComponent.MAX_EMULATOR_DATA_SIZE + VirtualMachineComponent.MAX_EMULATOR_STACK_SIZE;
    if (this.m_registers[Register.REG_ESP] >= MAX_STA) {
      this.m_strErr = 'Stack underflow';
      return FAIL;
    }
    const offBytes = this.m_registers[Register.REG_ESP];
    const valDst = this.getDwordFromMemory(offBytes);
    const opDst = instr.m_operandDst;
    this.putDataToOperand(opDst, valDst);
    const DWORD_SIZE = 4;
    this.m_registers[Register.REG_ESP] += DWORD_SIZE;
    return FAIL;
  }

  /**
  * Perform current instruction (run and modify instruction pointer)
  */
  performInstruction() {
    const numInstructions = this.m_instrSet.m_instructions.length;
    // check end of code
    if (this.m_curInstructionIndex >= numInstructions) {
      this.m_codeFinished = true;
    }
    const instr = this.m_instrSet.m_instructions[this.m_curInstructionIndex];
    // is this nop instruction
    if (instr.m_instruction === LexemType.LEXEM_OP_NOP) {
      this.m_curInstructionIndex++;
      if ((this.m_curInstructionIndex === numInstructions) && (!this.m_codeFinished)) {
        this.m_codeFinished = true;
      }
      return;
    }
    const indexInstructionAfterJmp = this.invokeInstruction(instr);
    if (this.m_strErr.length !== 0) {
      // it was error during execution
      return;
    }
    if (indexInstructionAfterJmp >= 0) {
      this.m_curInstructionIndex = indexInstructionAfterJmp;
    } else {
      this.m_curInstructionIndex++;
    }
    // check end of code
    if ((this.m_curInstructionIndex === numInstructions) && (!this.m_codeFinished)) {
      this.m_codeFinished = true;
    }
    // increment number of performed instructions in VM
    this.m_numPerformedInstructions++;
  }

  /**
  * Invoke instruction
  */
  invokeInstruction(instr) {

    // console.log(`VM. performInstruction. Instr to perform now: ${instr.m_instruction}`);
    if (instr.m_instruction === LexemType.LEXEM_OP_XOR) {
      // console.log('VM. do xor');
      return this.instrXor(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_AND) {
      // console.log('VM. do and');
      return this.instrAnd(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_OR) {
      // console.log('VM. do or');
      return this.instrOr(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_ADD) {
      // console.log('VM. do add');
      return this.instrAdd(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_SUB) {
      // console.log('VM. do sub');
      return this.instrSub(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_MUL) {
      // console.log('VM. do mul');
      return this.instrMul(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_DIV) {
      // console.log('VM. do div');
      return this.instrDiv(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_SHL) {
      // console.log('VM. do shl');
      return this.instrShl(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_SHR) {
      // console.log('VM. do shr');
      return this.instrShr(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_SAL) {
      // console.log('VM. do sal');
      return this.instrSal(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_SAR) {
      // console.log('VM. do sar');
      return this.instrSar(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_DEC) {
      return this.instrDec(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_INC) {
      return this.instrInc(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_NOT) {
      return this.instrNot(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_NEG) {
      return this.instrNeg(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_MOV) {
      return this.instrMov(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JMP) {
      return this.instrJmp(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JNZ) {
      return this.instrJnz(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JZ) {
      return this.instrJz(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JNS) {
      return this.instrJns(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JS) {
      return this.instrJs(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JGE) {
      return this.instrJge(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JL) {
      return this.instrJl(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JLE) {
      return this.instrJle(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JG) {
      return this.instrJg(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JB) {
      return this.instrJb(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JNB) {
      return this.instrJnb(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JBE) {
      return this.instrJbe(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_JA) {
      return this.instrJa(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_CMP) {
      return this.instrCmp(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_PUSH) {
      return this.instrPush(instr);
    } else if (instr.m_instruction === LexemType.LEXEM_OP_POP) {
      return this.instrPop(instr);
    }

    /*
    const func = this.m_backends[instr.m_instruction];
    if (func !== null) {
      const retVal = this.m_backends[instr.m_instruction](instr);
      return retVal;
    }
    */

    const lexParser = new LexemParser();
    const strErr = lexParser.getStringByLexem(instr.m_instruction);
    console.log(`Unimplemented instructiion code: ${strErr}`);
  }

}
