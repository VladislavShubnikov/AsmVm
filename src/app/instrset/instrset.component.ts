import { Component, OnInit } from '@angular/core';

import { InstructionComponent } from '../instruction/instruction.component';
import { LexemType } from '../core/lexemtype';
import { Register } from '../core/register';

@Component({
  selector: 'app-instrset',
  templateUrl: './instrset.component.html',
  styleUrls: ['./instrset.component.css']
})
export class InstrSetComponent implements OnInit {
  // ********************************************************
  // Data
  // ********************************************************
  m_instructions: InstructionComponent[];

  // ********************************************************
  // Methods
  // ********************************************************
  constructor() {
    const INIT_NUM_INST = 0;
    this.m_instructions = new Array(INIT_NUM_INST);
    /*
    this.m_instructions[0] = new InstructionComponent();
    this.m_instructions[1] = new InstructionComponent();

    this.m_instructions[0].m_instruction = LexemType.LEXEM_OP_INC;
    this.m_instructions[0].m_operandDst.m_register = Register.REG_EAX;

    this.m_instructions[1].m_instruction = LexemType.LEXEM_OP_DEC;
    this.m_instructions[1].m_operandDst.m_register = Register.REG_ECX;
    */
  }

  ngOnInit() {
  }

}
