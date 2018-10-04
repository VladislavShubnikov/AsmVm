import { Component, OnInit } from '@angular/core';

import { InstructionComponent } from '../instruction/instruction.component';
import { LexemType } from '../core/lexemtype';
import { Register } from '../core/register';
import { Compiler } from '../core/compiler';

@Component({
  selector: 'app-instrset',
  templateUrl: './instrset.component.html',
  styleUrls: ['./instrset.component.css']
})
export class InstrSetComponent implements OnInit {

  // ********************************************************
  // Const
  // ********************************************************

  static readonly NUM_LINES = 12;

  // ********************************************************
  // Data
  // ********************************************************

  m_instructions: InstructionComponent[];
  m_instrLines: string[];
  m_currentLine: number;

  // ********************************************************
  // Methods
  // ********************************************************
  constructor() {
    this.m_currentLine = 0;
    this.m_instructions = [];
    this.m_instrLines = new Array(InstrSetComponent.NUM_LINES);
    for (let i = 0; i < InstrSetComponent.NUM_LINES; i++) {
      this.m_instrLines[i] = '';
    }

    // test
    const strArr = [
      'LabelAgain:',
      '  cmp EAX, 0',
      '  jz LabelQuit',
      '  add EBX, ECX',
      '  dec ECX',
      '  jnz LabelAgain',
      'LabelQuit:',
      '  xor ECX, ECX'
    ];
    // test. build single string
    let strCode = '';
    for (let i = 0; i < strArr.length; i++) {
      strCode += strArr[i];
      strCode += '\n';
    }
    // test. compile code
    this.compilefromSource(strCode);
  }

  ngOnInit() {
  }

  isSelected(indStr) {
    const isSel = (indStr === this.m_currentLine);
    return isSel;
    // return true;
  }
  onClickButtonDown() {
    const numCompiledLines = this.m_instructions.length;
    const numLinesToShow = (numCompiledLines <= InstrSetComponent.NUM_LINES) ?
      numCompiledLines : InstrSetComponent.NUM_LINES;
    if (this.m_currentLine < numLinesToShow - 1) {
      this.m_currentLine++;
    }
  }
  onClickButtonUp() {
    if (this.m_currentLine > 0) {
      this.m_currentLine--;
    }
  }

  compilefromSource(strAsmText) {
    this.m_instructions = [];
    const compiler = new Compiler();
    const errCompileBool = compiler.createCode(strAsmText, this);
    if (!errCompileBool) {
      console.log(`Unexpected comple error = ${compiler.m_strErr}`);
    }
    const numCompiledLines = this.m_instructions.length;
    const numLinesToShow = (numCompiledLines <= InstrSetComponent.NUM_LINES) ?
      numCompiledLines : InstrSetComponent.NUM_LINES;
    for (let i = 0; i < numLinesToShow; i++) {
      const instr = this.m_instructions[i];
      const str = instr.getString();
      this.m_instrLines[i] = str;
    }
  }

}
