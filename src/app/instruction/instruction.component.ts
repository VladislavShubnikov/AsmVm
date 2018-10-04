// global imports
import { Component, OnInit } from '@angular/core';
// local imports
import { LexemType } from '../core/lexemtype';
import { Operand } from '../core/operand';
import { OperandType } from '../core/operandtype';
import { SizeModifier } from '../core/sizemodifier';
import { Register } from '../core/register';
import { LexemParser } from '../core/lexemparser';

@Component({
  selector: 'app-instruction',
  templateUrl: './instruction.component.html',
  styleUrls: ['./instruction.component.css']
})


export class InstructionComponent implements OnInit {
  // ******************************************************
  // Data
  // ******************************************************

  m_labelCode:    number;   // -1, if no label in this line
  m_instruction:  number;   // mov, xor, ...
  m_operandDst:   Operand;
  m_operandSrc:   Operand;

  // ******************************************************
  // Methods
  // ******************************************************

  constructor() {
    const INVAL_VAL = -1;
    this.m_labelCode = INVAL_VAL;
    this.m_instruction = LexemType.LEXEM_NA;
    this.m_operandDst = new Operand();
    this.m_operandSrc = new Operand();

    const MAG_A = 555555;
    const MAG_B = 666666;

    this.m_operandDst.m_operandType = OperandType.OPERAND_REGISTER;
    this.m_operandDst.m_sizeModifier = SizeModifier.SIZE_DWORD;
    this.m_operandDst.m_immediateInt = MAG_A;
    this.m_operandDst.m_register = Register.REG_EDX;

    this.m_operandSrc.m_operandType = OperandType.OPERAND_IMMEDIATE_INT;
    this.m_operandSrc.m_sizeModifier = SizeModifier.SIZE_WORD;
    this.m_operandSrc.m_immediateInt = MAG_B;
    this.m_operandSrc.m_register = Register.REG_ECX;
  }

  ngOnInit() {
  }
  getString() {
    let strOut = '';
    const INVAL_VAL = -1;
    if (this.m_labelCode !== INVAL_VAL) {
      strOut += `Label: ${this.m_labelCode}: `;
    }
    const lexParser = new LexemParser();
    const strInstr = lexParser.getStringByLexem(this.m_instruction);
    // strOut += `Instruction = ${this.m_instruction}. `;
    strOut += strInstr;
    strOut += ' ';
    strOut += this.m_operandDst.getString();
    const strSrcOp = this.m_operandSrc.getString();
    if (strSrcOp.length > 0) {
      strOut += ', ';
      strOut += strSrcOp;
    }
    return strOut;
  }

}
