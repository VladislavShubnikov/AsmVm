// ********************************************************
// Imports
// ********************************************************

import { Component, OnInit } from '@angular/core';

import { Register } from '../core/register';
import { RegFlags } from '../core/regflags';
import { OperandType } from '../core/operandtype';
import { InstructionComponent } from '../instruction/instruction.component';
import { InstrSetComponent } from '../instrset/instrset.component';


const KBYTE = 1024;
const TWO = 2;
const NUM_64 = 64;

type BackendCallback = (instr: InstructionComponent) => number;

// component description (decorator) shoul be declared just before
// export section
@Component({
  selector: 'app-virtual-machine',
  templateUrl: './virtual-machine.component.html',
  styleUrls: ['./virtual-machine.component.css']
})

export class VirtualMachineComponent implements OnInit {

  // ********************************************************
  // Const
  // ********************************************************

  static readonly MAX_EMULATOR_DATA_SIZE = (KBYTE * NUM_64);
  static readonly MAX_EMULATOR_STACK_SIZE = (KBYTE * TWO);

  // ********************************************************
  // Data
  // ********************************************************

  m_registers: number[];
  m_regFlags: number;
  m_data: number[];
  m_instrSet: InstrSetComponent;
  m_strErr: string;

  m_backends: BackendCallback[];

  // ********************************************************
  // Methods
  // ********************************************************

  constructor() {
    let i;
    this.m_registers = new Array(Register.REG_COUNT);
    for (i = 0; i < Register.REG_COUNT; i++) {
      this.m_registers[i] = 0;
    }
    this.m_regFlags = 0;
    const DATA_SZ_ALL = VirtualMachineComponent.MAX_EMULATOR_DATA_SIZE +
      VirtualMachineComponent.MAX_EMULATOR_STACK_SIZE;
    this.m_data = new Array(DATA_SZ_ALL);
    for (i = 0; i < DATA_SZ_ALL; i++) {
      this.m_data[i] = 0;
    }
    // init esp register to max possible stack value
    this.m_registers[Register.REG_ESP] = DATA_SZ_ALL;
    this.m_instrSet = null;
    // error message
    this.m_strErr = '';

    // setup back ends
    this.m_backends = [];
    this.m_backends.push(this.instrXor);
    this.m_backends.push(this.instrAnd);
    this.m_backends.push(this.instrOr);
    this.m_backends.push(this.instrAdd);
    this.m_backends.push(this.instrSub);
    this.m_backends.push(this.instrMul);
    this.m_backends.push(this.instrDiv);
  }

  ngOnInit() {
  }

  /**
  * return: -1, if bad
  */
  getDataFromOperand(operand) {
    const FAIL = -1;
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
      if (mem.mem.m_flagRegIndex) {
        if (mem.m_flagImmScale) {
          const indexReg = mem.m_registerBase;
          offsetDataBytes += this.m_registers[indexReg] * mem.m_immScale;
        } else {
          const indexReg = mem.m_registerBase;
          offsetDataBytes += this.m_registers[indexReg];
        }
      }
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
  putDataToOperand(operand, valDst) {
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
      }

    }
    return true;
  } // end of putDataToOperand

  static hasParity(val) {
    let i, numOnes;
    numOnes = 0;
    const NUM_BITS = 8;
    for (i = 0; i < NUM_BITS; i++) {
      /* tslint:disable-next-line */
      const mask = 1 << i;
      /* tslint:disable-next-line */
      if ((val & mask) !== 0) {
        numOnes++;
      }
    }
    /* tslint:disable-next-line */
    if ((numOnes & 1) !== 0)
      return false;
    return true;
  }

  modifyFlags(valDst) {
    // zero flag
    if (valDst === 0) {
      /* tslint:disable-next-line */
      this.m_regFlags |= RegFlags.FLAG_ZERO;
    } else {
      /* tslint:disable-next-line */
      this.m_regFlags &= ~RegFlags.FLAG_ZERO;
    }
    // sign flag
    if (valDst < 0) {
      /* tslint:disable-next-line */
      this.m_regFlags |= RegFlags.FLAG_SIGN;
    } else {
      /* tslint:disable-next-line */
      this.m_regFlags &= ~RegFlags.FLAG_SIGN;
    }
    if (VirtualMachineComponent.hasParity(valDst)) {
      /* tslint:disable-next-line */
      this.m_regFlags |= RegFlags.FLAG_PARITY;
    } else {
      /* tslint:disable-next-line */
      this.m_regFlags &= ~RegFlags.FLAG_PARITY;
    }
  }

  getData() {
    return this.m_data;
  }

  setupInstructionSet(instrSet) {
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
    /* tslint:disable-next-line */
    valDst = valDst ^ valSrc;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return 1;
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
    return 1;
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
    return 1;
  }
  instrAdd(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    let valDst = this.getDataFromOperand(opDst);
    const valSrc = this.getDataFromOperand(opSrc);
    valDst = valDst + valSrc;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return 1;
  }
  instrSub(instr) {
    const opDst = instr.m_operandDst;
    const opSrc = instr.m_operandSrc;
    let valDst = this.getDataFromOperand(opDst);
    const valSrc = this.getDataFromOperand(opSrc);
    valDst = valDst - valSrc;
    this.modifyFlags(valDst);
    this.putDataToOperand(opDst, valDst);
    return 1;
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
    return 1;
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
    /* tslint:disable-next-line */
    const valDivisor = divisorLo + (divisorHi << BITS_32);

    const valRes = Math.floor(valDivisor / valDst);
    const valRest = valDivisor - valRes * valDst;
    this.modifyFlags(valRes);

    this.m_registers[Register.REG_EAX] = valRes;
    this.m_registers[Register.REG_EDX] = valRest;
    return 1;
  }

  // TODO: instrShl


}
