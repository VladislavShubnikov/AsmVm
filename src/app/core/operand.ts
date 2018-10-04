import { OperandType } from './operandtype';
import { SizeModifier } from './sizemodifier';
import { Register } from './register';
import { RegisterParser } from './registerparser';
import { MemoryDesc } from './memorydesc';

export class Operand {

  // ********************************************************
  // Data
  // ********************************************************

  m_operandType:    number; // OperandType;
  m_sizeModifier:   number; // SIZE_DWORD, ...
  m_immediateInt:   number; // value itself
  m_register:       number; // REG_EAX, ...
  m_memoryDesc:     MemoryDesc;

  // ********************************************************
  // Methods
  // ********************************************************

  constructor() {
    const INVA_VAL = -1;
    this.m_operandType    = OperandType.OPERAND_NA;
    this.m_sizeModifier   = SizeModifier.SIZE_NA;
    this.m_immediateInt   = INVA_VAL;
    this.m_register       = Register.REG_NA;
    this.m_memoryDesc     = new MemoryDesc();
  }
  getString() {
    let strOut = '';
    // get operand type
    if (this.m_operandType === OperandType.OPERAND_IMMEDIATE_INT) {
      strOut += `${this.m_immediateInt}`;
    } else if (this.m_operandType === OperandType.OPERAND_REGISTER) {
      const regParser = new RegisterParser();
      const strRegName = regParser.getString(this.m_register);
      strOut += strRegName;
    } else if (this.m_operandType === OperandType.OPERAND_MEMORY) {
      if (this.m_sizeModifier === SizeModifier.SIZE_DWORD) {
        strOut += 'DWORD PTR ';
      } else if (this.m_sizeModifier === SizeModifier.SIZE_WORD) {
        strOut += 'WORD PTR ';
      } else if (this.m_sizeModifier === SizeModifier.SIZE_BYTE) {
        strOut += 'BYTE PTR ';
      }
      strOut += this.m_memoryDesc.getString();
    } else {
      // console.log('Bad operand type');
      return '';
    }
    return strOut;
  }
}
