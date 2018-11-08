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

  static readonly NUM_VISIBLE_LINES = 12;

  // ********************************************************
  // Data
  // ********************************************************

  public m_strUp: string;
  public m_strDown: string;
  public m_strCompiledCode: string;

  public m_instructions: InstructionComponent[];
  public m_instrLines: string[];
  public m_currentLine: number;
  public m_topLine: number;

  // ********************************************************
  // Methods
  // ********************************************************
  constructor() {

    this.m_strUp = 'Вверх';
    this.m_strDown = 'Вниз';
    this.m_strCompiledCode = 'Скомпилированный код';

    // top visible source line
    this.m_topLine = 0;
    // current executed line from source (relative to m_topLine)
    this.m_currentLine = 0;

    this.m_instructions = [];
    this.m_instrLines = new Array(InstrSetComponent.NUM_VISIBLE_LINES);
    for (let i = 0; i < InstrSetComponent.NUM_VISIBLE_LINES; i++) {
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
      '  xor ECX, ECX',
      '  add EAX, 8',
      '  add EAX, 9',
      '  add EAX, 10',
      '  add EAX, 11',
      '  add EAX, 12',
      '  add EAX, 13',
      '  add EAX, 14',
      '  add EAX, 15',
    ];
    // test. build single string
    let strCode = '';
    for (let i = 0; i < strArr.length; i++) {
      strCode += strArr[i];
      strCode += '\n';
    }
    // test. compile code
    this.compileFromSource(strCode);
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
    if (this.m_currentLine + this.m_topLine < numCompiledLines - 1) {
      this.m_currentLine++;
      if (this.m_currentLine >= InstrSetComponent.NUM_VISIBLE_LINES) {
        this.m_topLine++;
        this.m_currentLine--;
        this.fillLines();
      }
      // console.log(`onClickButtonDown. top = ${this.m_topLine} cur = ${this.m_currentLine}`);
    }
  }
  onClickButtonUp() {
    if (this.m_currentLine > 0) {
      this.m_currentLine--;
    } else {
      // current is top line
      if (this.m_topLine > 0) {
        this.m_topLine--;
        this.fillLines();
      }
    }
    // console.log(`onClickButtonUp. top = ${this.m_topLine} cur = ${this.m_currentLine}`);
  }
  public setCurrentLine(lineIndex: number) {
    if (lineIndex < this.m_topLine) {
      this.m_topLine = lineIndex;
      this.m_currentLine = 0;
      this.fillLines();
    } else if (lineIndex - this.m_topLine < InstrSetComponent.NUM_VISIBLE_LINES) {
      this.m_currentLine = lineIndex - this.m_topLine;
    } else {
      this.m_currentLine = InstrSetComponent.NUM_VISIBLE_LINES - 1;
      this.m_topLine = lineIndex - (InstrSetComponent.NUM_VISIBLE_LINES - 1);
      this.fillLines();
    }
    // console.log(`setCurrentLine. top = ${this.m_topLine} cur = ${this.m_currentLine}`);
  }

  private fillLines() {
    const numCompiledLines = this.m_instructions.length;
    const numLinesToShow = (numCompiledLines <= InstrSetComponent.NUM_VISIBLE_LINES) ?
      numCompiledLines : InstrSetComponent.NUM_VISIBLE_LINES;
    for (let i = 0; i < numLinesToShow; i++) {
      const indexLineSrc = this.m_topLine + i;
      if ((indexLineSrc >= 0) && (indexLineSrc < numCompiledLines)) {
        const instr = this.m_instructions[indexLineSrc];
        const str = instr.getString();
        this.m_instrLines[i] = str;
      } else {
        this.m_instrLines[i] = '';
      }
    }
  }

  public compileFromSource(strAsmText) {
    // empty instr set
    this.m_instructions = [];
    this.m_instrLines = [];

    const compiler = new Compiler();
    const errCompileBool = compiler.createCode(strAsmText, this);
    if (!errCompileBool) {
      console.log(`Unexpected comple error = ${compiler.m_strErr}`);
    }
    /*
    const numCompiledLines = this.m_instructions.length;
    const numLinesToShow = (numCompiledLines <= InstrSetComponent.NUM_VISIBLE_LINES) ?
      numCompiledLines : InstrSetComponent.NUM_VISIBLE_LINES;
    for (let i = 0; i < numLinesToShow; i++) {
      const instr = this.m_instructions[i];
      const str = instr.getString();
      this.m_instrLines[i] = str;
    }
    */
    this.m_topLine = 0;
    this.m_currentLine = 0;
    this.fillLines();
  }


}
