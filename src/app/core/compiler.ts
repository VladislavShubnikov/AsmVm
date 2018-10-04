// ********************************************************
// FILE: compiler.ts
// PURP: compile source asm text into intermediate
//       representation
// ********************************************************

// ********************************************************
// Imports
// ********************************************************
import { LexemType } from './lexemtype';
import { Lexem } from './lexem';
import { LexemParser } from './lexemparser';
import { Register } from './register';
import { Operand } from './operand';
import { OperandType } from './operandtype';
import { SizeModifier } from './sizemodifier';
import { MemoryDesc } from './memorydesc';
import { Preprocessor } from './preprocessor';

import { InstructionComponent } from '../instruction/instruction.component';
import { InstrSetComponent } from '../instrset/instrset.component';

const MAX_IDENTIFIER_LENGTH = 32;

/** Compile input text */
export class Compiler {
  // ********************************************************
  // Data
  // ********************************************************
  m_lexemSet:     Lexem[];
  m_charBuffer:   string;
  m_strErr:       string;
  m_lexemParser:  LexemParser;

  // ********************************************************
  // Methods
  // ********************************************************
  constructor() {
    this.m_charBuffer = '';
    this.m_lexemSet   = null;
    this.m_strErr = '';
    this.m_lexemParser = new LexemParser();
  }

  private getNumLines(strTaskCode) {
    let   numLines = 0;
    for (let i = 0; i < strTaskCode.length; i++) {
      const sym = strTaskCode.charAt(i);
      if (sym === '\n') {
        numLines++;
      }
    }
    numLines++;
    return numLines;
  }
  private getLineFromSourceCode(strTaskCode, lineNumber) {
    let iStr = 0;
    let i;
    const strCodeLen = strTaskCode.length;
    for (i = 0; i < lineNumber; i++) {
      // skip until NL
      while ( (iStr < strCodeLen) && (strTaskCode.charAt(iStr) !== '\n') ) {
        iStr++;
      }
      iStr++;
    }
    let strDst = '';
    while ((iStr < strCodeLen) && (strTaskCode.charAt(iStr) !== '\n')) {
      strDst += strTaskCode.charAt(iStr);
      iStr++;
    }
    return strDst;
  }
  private killCommentInLine(strLine) {
    let iStr;
    for (iStr = 0; (iStr < strLine.length) && (strLine.charAt(iStr) !== ';'); iStr++) {
      // do nothing
    }
    if (iStr >= strLine.length) {
      return strLine;
    }
    const strBefore = strLine.substr(0, iStr);
    return strBefore;
  }

  /**
   * Check line has at least one symbol
   * @return true, if has
   */
  private isLineEmpty(strLine) {
    let numAlphaNum = 0;
    for (let i = 0; i < strLine.length; i++) {
      const sym = strLine.charAt(i);
      if ((sym >= '0') && (sym <= '9')) {
        numAlphaNum++;
      }
      if ((sym >= 'a') && (sym <= 'z')) {
        numAlphaNum++;
      }
      if ((sym >= 'A') && (sym <= 'Z')) {
        numAlphaNum++;
      }
    }
    return (numAlphaNum === 0) ? true : false;
  }

  /**
   * Add lexem to set
   * @param lexType - Type of added lexem.
   * @return true, if success
   */
  private addLexem(lexType) {
    const lexem = new Lexem();
    lexem.m_type = lexType;
    this.m_lexemSet.push(lexem);
    return lexem;
  }

  /**
   * Add character to symbol set
   * @param symb - Added symbol
   * @return true, if success
   */
  private addCharBuffer(symb) {
    // collect characters for string
    this.m_charBuffer += symb;
    if (this.m_charBuffer.length >= MAX_IDENTIFIER_LENGTH) {
      this.m_strErr = `Too long identifier, started from ${this.m_charBuffer} ...`;
      return false;
    }
    return true;
  }

  /**
   * Get lexem from m_charBuffer
   * @return 0
   */
  private getLexemFromCharBuffer() {
    const lexType = this.m_lexemParser.getLexemByString(this.m_charBuffer);
    // console.log(`parsed lex type = [${lexType}] for buffer [${this.m_charBuffer}]`);
    let ret = false;
    if (lexType !== LexemType.LEXEM_NA) {
      if (lexType === LexemType.LEXEM_CONST_INT) {
        // special case: digits
        const valInt = parseInt(this.m_charBuffer, 10);
        const lex = this.addLexem(lexType);
        lex.m_constInt = valInt;
        this.m_charBuffer = '';
        ret = true;
      } else if (lexType === LexemType.LEXEM_IDENTIFIER) {
        // special case: identifier
        const lex = this.addLexem(lexType);
        lex.m_identifier = this.m_charBuffer;
        this.m_charBuffer = '';
        ret = true;
      } else {
        // add some lexem
        const lex = this.addLexem(lexType);
        this.m_charBuffer = '';
        ret = (lex.m_type !== LexemType.LEXEM_NA) ? true : false;
      }
    }
    return ret;
  }

  /**
   * Build lexems array fro string (source line)
   * @param strLine - Source string
   * @return lexem array, if success
   */
  public buildLexemsFromSourceLine(strLine) {
    const FAIL_VAL = -1;
    this.m_lexemSet = new Array();
    this.m_charBuffer = '';
    this.m_strErr = '';
    let i;
    for (i = 0; i < strLine.length; i++) {
      let sym = strLine.charAt(i);
      if (sym === '\n') {
        break;
      }
      // skip spaces
      if ((sym === ' ') || (sym === '\t')) {
        this.getLexemFromCharBuffer();
        continue;
      } // if
      // check end of line
      if (sym === '\n') {
        break;
      }
      // check comment
      if (sym === ';') {
        this.addLexem(LexemType.LEXEM_SEMICOLON);
        break;
      }
      // usual symbol
      if ((sym >= 'A') && (sym <= 'Z')) {
        sym = sym.toLowerCase();
      }
      if ((sym >= 'a') && (sym <= 'z')) {
        if (!this.addCharBuffer(sym)) {
          return [];
        }
        continue;
      }
      // usual digit
      if ((sym >= '0') && (sym <= '9')) {
        if (!this.addCharBuffer(sym)) {
          return [];
        }
        continue;
      }
      // single delimiter check
      if (sym === ':') {
        this.getLexemFromCharBuffer();
        this.addLexem(LexemType.LEXEM_COLON);
        continue;
      }
      if (sym === ',') {
        this.getLexemFromCharBuffer();
        this.addLexem(LexemType.LEXEM_COMMA);
        continue;
      }
      if (sym === '.') {
        this.getLexemFromCharBuffer();
        this.addLexem(LexemType.LEXEM_DOT);
        continue;
      }
      if (sym === '[') {
        this.getLexemFromCharBuffer();
        this.addLexem(LexemType.LEXEM_BRACKET_OPEN);
        continue;
      }
      if (sym === ']') {
        this.getLexemFromCharBuffer();
        this.addLexem(LexemType.LEXEM_BRACKET_CLOSE);
        continue;
      }
      if (sym === '+') {
        this.getLexemFromCharBuffer();
        this.addLexem(LexemType.LEXEM_PLUS);
        continue;
      }
      if (sym === '-') {
        this.getLexemFromCharBuffer();
        this.addLexem(LexemType.LEXEM_MINUS);
        continue;
      }
      if (sym === '*') {
        this.getLexemFromCharBuffer();
        this.addLexem(LexemType.LEXEM_MUL);
        continue;
      }
      if (sym === '/') {
        this.getLexemFromCharBuffer();
        this.addLexem(LexemType.LEXEM_DIV);
        continue;
      }
    } // for (i) all chars in line
    this.getLexemFromCharBuffer();
    return this.m_lexemSet;
  }

  private findLexemIndex(lexems, lexType) {
    const numLexems = lexems.length;
    for (let i = 0; i < numLexems; i++) {
      if (lexems[i].m_type === lexType) {
        return i;
      }
    }
    const INVALID_VAL = -1;
    return INVALID_VAL;
  }

  private replaceMinusImm(lexems) {
    const numLexems = lexems.length;
    let numToScan = numLexems;
    let i;
    for (i = 0; i < numLexems; i++) {
      if (lexems[i].m_type === LexemType.LEXEM_BRACKET_CLOSE) {
        numToScan = i + 1;
        break;
      }
    }
    for (i = 0; i < numToScan; i++) {
      const numRest = numToScan - i;
      const NUM_3 = 3;
      if (numRest >= NUM_3) {
        if ( (lexems[i].m_type === LexemType.LEXEM_MINUS) && (lexems[i + 1].m_type === LexemType.LEXEM_CONST_INT) ) {
          lexems[i].m_type = LexemType.LEXEM_PLUS;
          lexems[i + 1].m_constInt = -lexems[i + 1].m_constInt;
          i++;
        }
      }
    } // for (i)
  }
  private reduceRegMulImm(lexems, operand) {
    let numLexems = lexems.length;
    let numToScan = numLexems;
    let i;
    for (i = 0; i < numLexems; i++) {
      if (lexems[i].m_type === LexemType.LEXEM_BRACKET_CLOSE) {
        numToScan = i + 1;
        break;
      }
    }

    const FAIL_VAL = -1;
    for (i = 0; i < numToScan; i++) {
      const numRest = numToScan - i;
      const NUM_2 = 2;
      const NUM_3 = 3;
      if (numRest >= NUM_3) {
        if ( (lexems[i].isRegister()) && (lexems[i + 1].m_type === LexemType.LEXEM_MUL) &&
          (lexems[i + NUM_2].m_type === LexemType.LEXEM_CONST_INT) ) {
          if (operand.m_memoryDesc.m_flagRegIndex) {
            this.m_strErr = 'Already has index register in memory reference';
            return FAIL_VAL;
          }
          operand.m_memoryDesc.m_registerIndex = lexems[i + 0].m_type - LexemType.LEXEM_REG_EAX;
          operand.m_memoryDesc.m_immScale = lexems[i + NUM_2].m_constInt;
          operand.m_memoryDesc.m_flagRegIndex = true;
          operand.m_memoryDesc.m_flagImmScale = true;
          this.removeElemsFrom(lexems, i, NUM_3);
          numLexems = lexems.length;
          break;
        }
        if ( (lexems[i].m_type === LexemType.LEXEM_CONST_INT) &&
          (lexems[i + 1].m_type === LexemType.LEXEM_MUL) && lexems[i + NUM_2].isRegister() ) {
          if (operand.m_memoryDesc.m_flagRegIndex) {
            this.m_strErr = 'Already has index register in memory reference';
            return FAIL_VAL;
          }
          operand.m_memoryDesc.m_registerIndex = lexems[i + NUM_2].m_type - LexemType.LEXEM_REG_EAX;
          operand.m_memoryDesc.m_immScale = lexems[i + 0].m_constInt;
          operand.m_memoryDesc.m_flagRegIndex = true;
          operand.m_memoryDesc.m_flagImmScale = true;
          this.removeElemsFrom(lexems,  i, NUM_3);
          numLexems = lexems.length;
          break;
        }
      }
    } // for (i)
    return 0;
  }
  private reduceRegPlus(lexems, operand) {
    let numLexems = lexems.length;
    let numToScan = numLexems;
    let i;
    for (i = 0; i < numLexems; i++) {
      if (lexems[i].m_type === LexemType.LEXEM_BRACKET_CLOSE) {
        numToScan = i + 1;
        break;
      }
    }
    const FAIL_VAL = -1;
    const NUM_2 = 2;
    for (i = 0; i < numToScan; i++) {
      const numRest = numToScan - i;
      if (numRest >= NUM_2) {
        if ( (lexems[0].isRegister()) && (lexems[i + 1].m_type === LexemType.LEXEM_PLUS) ) {
          if (operand.m_memoryDesc.m_flagRegBase) {
            this.m_strErr = 'Already has base register in memory reference';
            return FAIL_VAL;
          }
          operand.m_memoryDesc.m_registerBase = lexems[i + 0].m_type - LexemType.LEXEM_REG_EAX;
          operand.m_memoryDesc.m_flagRegBase = true;
          this.removeElemsFrom(lexems, i, NUM_2);
          numLexems = lexems.length;
          break;
        } else if ( (lexems[i + 0].m_type === LexemType.LEXEM_PLUS) && lexems[i + 1].isRegister() ) {
          if (operand.m_memoryDesc.m_flagRegBase) {
            this.m_strErr = 'Already has base register in memory reference';
            return FAIL_VAL;
          }
          operand.m_memoryDesc.m_registerBase = lexems[i + 1].m_type - LexemType.LEXEM_REG_EAX;
          operand.m_memoryDesc.m_flagRegBase = true;
          this.removeElemsFrom(lexems, i, NUM_2);
          numLexems = lexems.length;
          break;
        }
      }
    } // for (i)
    return 0;
  }
  private reduceImmPlus(lexems, operand) {
    let numLexems = lexems.length;
    let numToScan = numLexems;
    let i;
    for (i = 0; i < numLexems; i++) {
      if (lexems[i].m_type === LexemType.LEXEM_BRACKET_CLOSE) {
        numToScan = i + 1;
        break;
      }
    }
    const FAIL_VAL = -1;
    const NUM_2 = 2;
    for (i = 0; i < numToScan; i++) {
      const numRest = numToScan - i;
      if (numRest >= NUM_2) {
        if ((lexems[i + 0].m_type === LexemType.LEXEM_CONST_INT) && (lexems[i + 1].m_type ===  LexemType.LEXEM_PLUS)) {
          if (operand.m_memoryDesc.m_flagImmAdd) {
            this.m_strErr = 'Already has immediate addition operand in memory reference';
            return FAIL_VAL;
          }
          operand.m_memoryDesc.m_immAdd = lexems[i + 0].m_constInt;
          operand.m_memoryDesc.m_flagImmAdd = true;
          this.removeElemsFrom(lexems, i, NUM_2);
          numLexems = lexems.length;
          break;
        } else if ((lexems[i + 0].m_type === LexemType.LEXEM_PLUS) && (lexems[i + 1].m_type === LexemType.LEXEM_CONST_INT)) {
          if (operand.m_memoryDesc.m_flagImmAdd) {
            this.m_strErr = 'Already has immediate addition operand in memory reference';
            return FAIL_VAL;
          }
          operand.m_memoryDesc.m_immAdd = lexems[i + 1].m_constInt;
          operand.m_memoryDesc.m_flagImmAdd = true;
          this.removeElemsFrom(lexems, i, NUM_2);
          numLexems = lexems.length;
          break;
        }
      }
    }
    return 0;
  }
  private reduceMinusImm(lexems, operand) {
    let numLexems = lexems.length;
    let numToScan = numLexems;
    let i;
    for (i = 0; i < numLexems; i++) {
      if (lexems[i].m_type === LexemType.LEXEM_BRACKET_CLOSE) {
        numToScan = i + 1;
        break;
      }
    }
    const FAIL_VAL = -1;
    const NUM_2 = 2;
    for (i = 0; i < numToScan; i++) {
      const numRest = numToScan - i;
      if (numRest >= NUM_2) {
        if ((lexems[i + 0].m_type === LexemType.LEXEM_MINUS) && (lexems[i + 1].m_type ===  LexemType.LEXEM_CONST_INT)) {
          if (operand.m_memoryDesc.m_flagImmAdd) {
            this.m_strErr = 'Already has immediate addition operand in memory reference';
            return FAIL_VAL;
          }
          operand.m_memoryDesc.m_immAdd = lexems[i + 1].m_constInt;
          operand.m_memoryDesc.m_flagImmAdd = true;
          this.removeElemsFrom(lexems, i, NUM_2);
          numLexems = lexems.length;
          break;
        }
      }
    }
    return 0;
  }

  private reduceReg(lexems, operand) {
    let numLexems = lexems.length;
    let numToScan = numLexems;
    let i;
    for (i = 0; i < numLexems; i++) {
      if (lexems[i].m_type === LexemType.LEXEM_BRACKET_CLOSE) {
        numToScan = i + 1;
        break;
      }
    }
    const FAIL_VAL = -1;
    const NUM_2 = 2;
    for (i = 0; i < numToScan; i++) {
      const numRest = numToScan - i;
      if (numRest >= 1) {
        if (lexems[i].isRegister()) {
          if (operand.m_memoryDesc.m_flagRegBase === false) {
            operand.m_memoryDesc.m_registerBase = lexems[i].m_type - LexemType.LEXEM_REG_EAX;
            operand.m_memoryDesc.m_flagRegBase = true;
          } else if (operand.m_memoryDesc.m_flagRegIndex === false) {
            operand.m_memoryDesc.m_registerIndex = lexems[i].m_type - LexemType.LEXEM_REG_EAX;
            operand.m_memoryDesc.m_flagRegIndex = true;
          } else {
            this.m_strErr = 'Too many registers in memory reference';
            return FAIL_VAL;
          }
          this.removeElemsFrom(lexems, i, 1);
          numLexems = lexems.length;
          break;
        }
      }
    }
    return 0;
  }

  private reduceImm(lexems, operand) {
    let numLexems = lexems.length;
    let numToScan = numLexems;
    let i;
    for (i = 0; i < numLexems; i++) {
      if (lexems[i].m_type === LexemType.LEXEM_BRACKET_CLOSE) {
        numToScan = i + 1;
        break;
      }
    }
    const FAIL_VAL = -1;
    const NUM_2 = 2;
    for (i = 0; i < numToScan; i++) {
      const numRest = numToScan - i;
      if (numRest >= 1) {
        if (lexems[i].m_type === LexemType.LEXEM_CONST_INT) {
          if (operand.m_memoryDesc.m_flagImmAdd) {
            this.m_strErr = 'Too many immediate additions in memory reference';
            return FAIL_VAL;
          }
          operand.m_memoryDesc.m_immAdd      = lexems[i].m_constInt;
          operand.m_memoryDesc.m_flagImmAdd  = true;
          this.removeElemsFrom(lexems,  i, 1);
          numLexems = lexems.length;
          break;
        }
      }
    }
    return 0;
  }

  /**
   * Remove first N items from array
   * @param lexems - lexem list
   * @param numLexemsToRemove - number of lexems to remove
   * @return nothing
   */
  public removeFirstElems(lexems, numLexemsToRemove) {
    lexems.splice(0, numLexemsToRemove);
  }
  private removeElemsFrom(lexems, indexFrom, numToRemove) {
    lexems.splice(indexFrom, numToRemove);
  }

  debugConsolePrintObject(strMsg, objVar) {
    // const str = JSON.stringify(objVar, null, 4);
    // console.log(`${strMsg} ${str}`);
    let strOut = '';
    for (const compn of Object.keys(objVar)) {
      strOut += `[${compn}] =  ${objVar[compn]} `;
    }
    console.log(`${strMsg} ${strOut}`);
  }

  /**
   * Get 2 operands for istruction
   * @param operandDst - dest op
   * @param operandSrc - source op
   * @param lexems - lexem list
   * @return false if error
   */
  public getOperands(operandDst, operandSrc, lexems) {
    let numLexems = lexems.length;
    if (numLexems <= 0) {
      return true;
    }
    // default operation size is DWORD
    operandDst.m_sizeModifier = SizeModifier.SIZE_DWORD;
    // first is immediate int
    const FAIL_VAL = -1;
    const NUM_1 = 1;
    const NUM_2 = 2;
    const NUM_3 = 3;
    if (lexems[0].m_type === LexemType.LEXEM_CONST_INT) {
      operandDst.m_operandType = OperandType.OPERAND_IMMEDIATE_INT;
      operandDst.m_immediateInt = lexems[0].m_constInt;
      this.removeFirstElems(lexems, 1);
      numLexems = lexems.length;
    } else if ((lexems[0].m_type >= LexemType.LEXEM_REG_EAX) && (lexems[0].m_type <= LexemType.LEXEM_REG_EDI)) {
      // first is register
      operandDst.m_operandType = OperandType.OPERAND_REGISTER;
      operandDst.m_register = lexems[0].m_type - LexemType.LEXEM_REG_EAX;
      this.removeFirstElems(lexems, 1);
      numLexems = lexems.length;
    } else {
      // first is [ ] memory reference
      if (lexems[0].m_type === LexemType.LEXEM_BRACKET_OPEN) {
        this.removeFirstElems(lexems, 1);
        numLexems = lexems.length;
      } else if ((numLexems >= NUM_3) && (lexems[0].m_type === LexemType.LEXEM_DWORD) &&
        (lexems[NUM_1].m_type === LexemType.LEXEM_PTR) && (lexems[NUM_2].m_type === LexemType.LEXEM_BRACKET_OPEN)) {
        // first is memory reference with size modifier DWORD
        operandDst.m_sizeModifier = SizeModifier.SIZE_DWORD;
        this.removeFirstElems(lexems, NUM_3);
        numLexems = lexems.length;
      } else if ((numLexems >= NUM_3) && (lexems[0].m_type === LexemType.LEXEM_WORD)  &&
        (lexems[NUM_1].m_type === LexemType.LEXEM_PTR) && (lexems[NUM_2].m_type === LexemType.LEXEM_BRACKET_OPEN)) {
        // first is memory reference with size modifier WORD
        operandDst.m_sizeModifier = SizeModifier.SIZE_WORD;
        this.removeFirstElems(lexems, NUM_3);
        numLexems = lexems.length;
      } else if ((numLexems >= NUM_3) && (lexems[0].m_type === LexemType.LEXEM_BYTE)  &&
        (lexems[NUM_1].m_type === LexemType.LEXEM_PTR) && (lexems[NUM_2].m_type === LexemType.LEXEM_BRACKET_OPEN)) {
        // first is memory reference with size modifier BYTE
        operandDst.m_sizeModifier = SizeModifier.SIZE_BYTE;
        this.removeFirstElems(lexems, NUM_3);
        numLexems = lexems.length;
      } else {
        this.m_strErr = 'Improper operand';
        return false;
      }
      operandDst.m_operandType                   = OperandType.OPERAND_MEMORY;
      operandDst.m_memoryDesc.m_flagImmAdd       =
        operandDst.m_memoryDesc.m_flagImmScale   =
        operandDst.m_memoryDesc.m_flagRegBase    =
        operandDst.m_memoryDesc.m_flagRegIndex   = false;
      // check exisiting ']'
      const indexBraceClose = this.findLexemIndex(lexems, LexemType.LEXEM_BRACKET_CLOSE);
      if (indexBraceClose < 0) {
        this.m_strErr = 'Closed bracked ] not found';
        return false;
      }
      // replace
      // - XXX
      // to
      // '+', imm(-XXX)
      this.replaceMinusImm(lexems);
      // try to reduce expression in lexem array
      if (this.reduceRegMulImm(lexems, operandDst) < 0) {
        return false;
      }
      if (this.reduceRegPlus(lexems, operandDst) < 0) {
        return false;
      }
      if (this.reduceImmPlus(lexems, operandDst) < 0) {
        return false;
      }
      if (this.reduceMinusImm(lexems, operandDst) < 0) {
        return false;
      }
      if (this.reduceReg(lexems, operandDst) < 0) {
        return false;
      }
      if (this.reduceImm(lexems, operandDst) < 0) {
        return false;
      }
      // check illegal scale
      if (operandDst.m_memoryDesc.m_flagImmScale) {
        const SCALE_2 = 2;
        const SCALE_4 = 4;
        const SCALE_8 = 8;
        const isCorrectScale = (operandDst.m_memoryDesc.m_immScale === SCALE_2) ||
          (operandDst.m_memoryDesc.m_immScale === SCALE_4) ||
          (operandDst.m_memoryDesc.m_immScale === SCALE_8);
        if (!isCorrectScale) {
          this.m_strErr = 'Invalid scale in memory reference. Can be 2,4,8';
          return false;
        }
      }
      // check is next lexem is close brace
      numLexems = lexems.length;
      if (numLexems < 1) {
        this.m_strErr = 'Syntax error in memory reference';
        return false;
      }
      if (lexems[0].m_type !== LexemType.LEXEM_BRACKET_CLOSE) {
        this.m_strErr = 'Expected closed brace(])';
        return false;
      }
      // remove close brace
      this.removeFirstElems(lexems, 1);
      numLexems = lexems.length;
    } // if wait memory reference
    numLexems = lexems.length;
    if (numLexems <= 0) {
      return true;
    }

    // should be ','
    if (lexems[0].m_type !== LexemType.LEXEM_COMMA) {
      this.m_strErr = 'Should be comma(,)';
      return false;
    }
    this.removeFirstElems(lexems, 1);
    numLexems = lexems.length;
    if (numLexems <= 0)  {
      this.m_strErr = 'Second operator missed; found newline';
      return false;
    }

    // console.log(`getOperands. Before src. numLexems = ${numLexems}`);
    // for (let i = 0; i < numLexems; i++) {
    //   const strDeb = `lexem[${i}]:`;
    //   this.debugConsolePrintObject(strDeb, lexems[i]);
    // }

    // read src
    operandDst.m_sizeModifier = SizeModifier.SIZE_DWORD;

    // check first is immediate int
    let isImmInt = false;
    if (lexems[0].m_type === LexemType.LEXEM_CONST_INT) {
      isImmInt = true;
    } else if (numLexems >= NUM_2) {
      if ((lexems[0].m_type === LexemType.LEXEM_MINUS) && (lexems[1].m_type === LexemType.LEXEM_CONST_INT)) {
        isImmInt = true;
      }
    }
    // first is immediate int
    if (isImmInt) {
      if (lexems[0].m_type === LexemType.LEXEM_CONST_INT) {
        operandSrc.m_operandType = OperandType.OPERAND_IMMEDIATE_INT;
        operandSrc.m_immediateInt = lexems[0].m_constInt;
        this.removeFirstElems(lexems, 1);
        numLexems = lexems.length;
        // console.log(`getOperands. detect IMM_INT operand. final numLexems = ${numLexems}`);
      } else {
        operandSrc.m_operandType = OperandType.OPERAND_IMMEDIATE_INT;
        operandSrc.m_immediateInt = -lexems[1].m_constInt;
        this.removeFirstElems(lexems, NUM_2);
        numLexems = lexems.length;
      }
    } else if ((lexems[0].m_type >= LexemType.LEXEM_REG_EAX) && (lexems[0].m_type <= LexemType.LEXEM_REG_EDI)) {
      // if first is register
      operandSrc.m_operandType = OperandType.OPERAND_REGISTER;
      operandSrc.m_register = lexems[0].m_type - LexemType.LEXEM_REG_EAX;
      this.removeFirstElems(lexems, 1);
      numLexems = lexems.length;
    } else {
      const OFF_0 = 0;
      const OFF_1 = 1;
      const OFF_2 = 2;
      // first is [ ] memory reference
      if (lexems[0].m_type === LexemType.LEXEM_BRACKET_OPEN) {
        this.removeFirstElems(lexems, 1);
        numLexems = lexems.length;
      } else if ((numLexems >= NUM_3) &&
        (lexems[OFF_0].m_type === LexemType.LEXEM_DWORD) &&
        (lexems[OFF_1].m_type === LexemType.LEXEM_PTR) &&
        (lexems[OFF_2].m_type === LexemType.LEXEM_BRACKET_OPEN)) {
        // first is memory reference with size modifier DWORD
        operandSrc.m_sizeModifier = SizeModifier.SIZE_DWORD;
        this.removeFirstElems(lexems, NUM_3);
        numLexems = lexems.length;
      } else if ((numLexems >= NUM_3) &&
        (lexems[OFF_0].m_type === LexemType.LEXEM_WORD) &&
        (lexems[OFF_1].m_type === LexemType.LEXEM_PTR) &&
        (lexems[OFF_2].m_type === LexemType.LEXEM_BRACKET_OPEN)) {
        // first is memory reference with size modifier WORD
        operandSrc.m_sizeModifier = SizeModifier.SIZE_WORD;
        this.removeFirstElems(lexems, NUM_3);
        numLexems = lexems.length;
      } else if ((numLexems >= NUM_3) &&
        (lexems[OFF_0].m_type === LexemType.LEXEM_BYTE) &&
        (lexems[OFF_1].m_type === LexemType.LEXEM_PTR) &&
        (lexems[OFF_2].m_type === LexemType.LEXEM_BRACKET_OPEN)) {
        // first is memory reference with size modifier BYTE
        operandSrc.m_sizeModifier = SizeModifier.SIZE_BYTE;

        this.removeFirstElems(lexems, NUM_3);
        numLexems = lexems.length;
      } else {
        this.m_strErr = 'Improper operand';
        return false;
      }
      // setup src operand
      operandSrc.m_operandType = OperandType.OPERAND_MEMORY;
      operandSrc.m_memoryDesc.m_flagImmAdd =
        operandSrc.m_memoryDesc.m_flagImmScale =
        operandSrc.m_memoryDesc.m_flagRegBase =
        operandSrc.m_memoryDesc.m_flagRegIndex = false;
      // wait Reg1 + Reg2 * Imm1 + Imm2 ]

      // check existing ]
      const indexBraceClose = this.findLexemIndex(lexems, LexemType.LEXEM_BRACKET_CLOSE);
      if (indexBraceClose < 0) {
        this.m_strErr = 'Closed brace (]) not found';
        return false;
      }
      // replace
      // - XXX
      // to
      // '+', imm(-XXX)
      this.replaceMinusImm(lexems);
      // try to reduce expression in lexem array
      if (this.reduceRegMulImm(lexems, operandSrc) < 0) {
        return false;
      }
      if (this.reduceRegPlus(lexems, operandSrc) < 0) {
        return false;
      }
      if (this.reduceImmPlus(lexems, operandSrc) < 0) {
        return false;
      }
      if (this.reduceMinusImm(lexems, operandSrc) < 0) {
        return false;
      }
      if (this.reduceReg(lexems, operandSrc) < 0) {
        return false;
      }
      if (this.reduceImm(lexems, operandSrc) < 0) {
        return false;
      }
      // check illegal scale
      if (operandSrc.m_memoryDesc.m_flagImmScale) {
        const SC_2 = 2;
        const SC_4 = 4;
        const SC_8 = 8;
        const isCorrectScale =
          (operandSrc.m_memoryDesc.m_immScale === SC_2) ||
          (operandSrc.m_memoryDesc.m_immScale === SC_4) ||
          (operandSrc.m_memoryDesc.m_immScale === SC_8);
        // console.log(`Src imm op detected = ${operandSrc.m_memoryDesc.m_immScale}. isCorrect = ${isCorrectScale}`);
        if (!isCorrectScale) {
          this.m_strErr = 'Invalid scale in memory reference. Can be 2,4,8';
          return false;
        }
      }
      // check is next lexem is close brace
      if (numLexems < 1) {
        this.m_strErr = 'Syntax error in memory reference';
        return false;
      }
      if (lexems[0].m_type !== LexemType.LEXEM_BRACKET_CLOSE) {
        this.m_strErr = 'Expected closed brace(])';
        return false;
      }
      // remove close brace
      this.removeFirstElems(lexems, 1);
      numLexems = lexems.length;
    } // if first memory reference
    if (numLexems > 0) {
      this.m_strErr = 'Expected end of line';
      return true;
    }
    return true;
  } // end of getOperands

  private createInstructionSet(strTaskCode, instrSet) {
    instrSet.m_instructions = null;
    this.m_strErr = '';
    const numApproxCommands = this.getNumLines(strTaskCode);
    console.log(`Complier. createInstructionSet. numApproxCommands = ${numApproxCommands}`);
    instrSet.m_instructions = new Array(0);

    let lineNumber;
    for (lineNumber = 0; lineNumber < numApproxCommands; lineNumber++) {
      // TODO: check this func when 1st line started from comment and have no instructions
      let strLine = this.getLineFromSourceCode(strTaskCode, lineNumber);
      // console.log(`current line[${lineNumber}] = ${strLine}`);
      if (strLine.length === 0) {
        // it can be commented line or just empty line
        // console.log(`Compler. createInstructionSet. Empty line # ${lineNumber}`);
        continue;
      }
      strLine = this.killCommentInLine(strLine);
      const isEmpty = this.isLineEmpty(strLine);
      if (isEmpty) {
        // console.log(`Compler. createInstructionSet. Empty line # ${lineNumber}`);
        continue;
      }
      // Get lexems from line
      const lexems = this.buildLexemsFromSourceLine(strLine);
      // check array
      if (this.m_strErr.length !== 0) {
        console.log(`Compler. createInstructionSet. was error: ${this.m_strErr}`);
        return false;
      }
      let numLexems = lexems.length;
      if (numLexems < 1) {
        console.log(`Compler. createInstructionSet. No lexem generated from source line: ${strLine}`);
        continue;
      }

      // console.log(`${numLexems} lexems were builded from code <${strLine}>`);
      // console.log(`lexem 0 type = ${lexems[0].m_type}`);

      // convert lexem array ino instruction
      const instr = new InstructionComponent();
      instr.m_instruction = LexemType.LEXEM_NA;
      const INVALID_VAL = -1;
      instr.m_labelCode = INVALID_VAL;
      // check is this label
      const TWO = 2;
      if ( (numLexems >= TWO) &&
        (lexems[0].m_type === LexemType.LEXEM_CONST_INT) &&
        (lexems[1].m_type === LexemType.LEXEM_COLON) ) {
        // console.log(`Label detected and compiled`);
        instr.m_labelCode = lexems[0].m_constInt;
        this.removeFirstElems(lexems, TWO); // remove label and colon
        numLexems = lexems.length;
      }
      // is this label
      if ( numLexems === 0) {
        instr.m_instruction = LexemType.LEXEM_OP_NOP;
        instr.m_operandDst.m_operandType = OperandType.OPERAND_NA;
        instr.m_operandSrc.m_operandType = OperandType.OPERAND_NA;
        instrSet.m_instructions.push(instr);
        continue;
      }
      // expect instruction code
      if ((lexems[0].m_type < LexemType.LEXEM_OP_NOP) || (lexems[0].m_type >= LexemType.LEXEM_OP_LAST)) {
        const strA = `Error syntax in line [${lineNumber + 1}]`;
        const strB = `Source code = ${strLine}`;
        const strC = 'Expected instruction, but not found';
        this.m_strErr = `${strA} ${strB} ${strC}`;
        console.log(`Compler. createInstructionSet. Expected instruction in source: ${strLine}`);
        return false;
      }
      instr.m_instruction = lexems[0].m_type;
      this.removeFirstElems(lexems, 1); // remove instruction mnemonic
      numLexems = lexems.length;

      const operandSrc = instr.m_operandSrc;
      const operandDst = instr.m_operandDst;
      operandSrc.m_operandType = OperandType.OPERAND_NA;
      operandSrc.m_sizeModifier = SizeModifier.SIZE_NA;
      operandSrc.m_immediateInt = INVALID_VAL;
      operandSrc.m_register     = Register.REG_NA;
      operandSrc.m_memoryDesc.setInvalid();

      operandDst.m_operandType = OperandType.OPERAND_NA;
      operandDst.m_sizeModifier = SizeModifier.SIZE_NA;
      operandDst.m_immediateInt = INVALID_VAL;
      operandDst.m_register     = Register.REG_NA;
      operandDst.m_memoryDesc.setInvalid();

      // const objA = operandDst.m_operandType;
      // const objB = OperandType.OPERAND_REGISTER;
      // console.log(`typeof operandDst.m_operandType = ${typeof(objA)}`);
      // console.log(`typeof OperandType.OPERAND_REGISTER = ${typeof(objB)}`);

      const resGetOps = this.getOperands(operandDst, operandSrc, lexems);
      if (!resGetOps) {
        const strA = `Error syntax in line [${lineNumber + 1}]`;
        const strB = `Source code = ${strLine}`;
        const strC = this.m_strErr;
        this.m_strErr = `${strA} ${strB} ${strC}`;
        console.log(`Compler. createInstructionSet. Bad operands in source: ${strLine}`);
        return false;
      }
      // check possible combination of operation operandDst, operandSrc
      numLexems = lexems.length;
      switch (instr.m_instruction) {
        case LexemType.LEXEM_OP_NOP: {
          if ((numLexems > 0) || (operandDst.m_operandType !== OperandType.OPERAND_NA)) {
            const strA = `Error syntax in line [${lineNumber + 1}]`;
            const strB = `Source code = ${strLine}`;
            const strC = 'Expected only nop\n';
            this.m_strErr = `${strA} ${strB} ${strC}`;
            console.log(`Compler. createInstructionSet.Imposs operands in source: ${strLine}`);
            return false;
          }
          break;
        } // case
        // 1 operand
        case LexemType.LEXEM_OP_PUSH: {
          break;
        }
        // 1 operand
        //
        // expect
        // INSTR Reg
        // INSTR Mem
        case LexemType.LEXEM_OP_NOT:
        case LexemType.LEXEM_OP_NEG:
        case LexemType.LEXEM_OP_INC:
        case LexemType.LEXEM_OP_DEC:
        case LexemType.LEXEM_OP_POP:
        case LexemType.LEXEM_OP_MUL:
        case LexemType.LEXEM_OP_DIV:
        {
          // console.log('createInstructionSet. not... div operation.');
          if (operandSrc.m_operandType !== OperandType.OPERAND_NA) {
            const strA = `Error syntax in line [${lineNumber + 1}]`;
            const strB = `Source code = ${strLine}`;
            const strC = 'Should be 1 operand\n';
            this.m_strErr = `${strA} ${strB} ${strC}`;
            console.log(`Compler. createInstructionSet. operand src bad: ${strLine}`);
            return false;
          }
          if ((operandDst.m_operandType !== OperandType.OPERAND_REGISTER) &&
            (operandDst.m_operandType !== OperandType.OPERAND_MEMORY)) {
            const strA = `Error syntax in line [${lineNumber + 1}]`;
            const strB = `Source code = ${strLine}`;
            const strC = 'Destination operand should register or memory\n';
            this.m_strErr = `${strA} ${strB} ${strC}`;
            console.log(`Compler. createInstructionSet. operand dst bad: ${strLine}`);
            return false;
          }
          break;
        } // case

        // 1 operand Jump Identifier
        case LexemType.LEXEM_OP_JMP:
        case LexemType.LEXEM_OP_JNZ:
        case LexemType.LEXEM_OP_JZ:
        case LexemType.LEXEM_OP_JS:
        case LexemType.LEXEM_OP_JNS:
        case LexemType.LEXEM_OP_JC:
        case LexemType.LEXEM_OP_JNC:
        case LexemType.LEXEM_OP_JNE:
        case LexemType.LEXEM_OP_JE:
        case LexemType.LEXEM_OP_JGE:
        case LexemType.LEXEM_OP_JNGE:
        case LexemType.LEXEM_OP_JG:
        case LexemType.LEXEM_OP_JNG:
        case LexemType.LEXEM_OP_JBE:
        case LexemType.LEXEM_OP_JNBE:
        case LexemType.LEXEM_OP_JB:
        case LexemType.LEXEM_OP_JNB:
        case LexemType.LEXEM_OP_JLE:
        case LexemType.LEXEM_OP_JNLE:
        case LexemType.LEXEM_OP_JL:
        case LexemType.LEXEM_OP_JNL:
        case LexemType.LEXEM_OP_JA:
        case LexemType.LEXEM_OP_JNA:
        case LexemType.LEXEM_OP_JAE:
        case LexemType.LEXEM_OP_JNAE: {
          if (operandSrc.m_operandType !== OperandType.OPERAND_NA) {
            const strA = `Error syntax in line [${lineNumber + 1}]`;
            const strB = `Source code = ${strLine}`;
            const strC = 'Should be 1 operand in jump instruction\n';
            this.m_strErr = `${strA} ${strB} ${strC}`;
            console.log(`Compler. createInstructionSet. should be 1 operand for jump instr: ${strLine}`);
            return false;
          }

          break;
        } // case

        // 2 operands
        // expect
        // INSTR Reg, Reg
        // INSTR Reg, Imm
        // INSTR Reg, Mem
        // INSTR Mem, Imm
        // INSTR Mem, Reg

        // Improper case
        // INSTR Imm, Imm
        // INSTR Imm, Mem
        // INSTR Imm, Reg
        // INSTR Mem, Mem
        // printf("Improper operand type for XOR\n");

        case LexemType.LEXEM_OP_XOR:
        case LexemType.LEXEM_OP_AND:
        case LexemType.LEXEM_OP_OR:
        case LexemType.LEXEM_OP_MOV:
        case LexemType.LEXEM_OP_ADD:
        case LexemType.LEXEM_OP_SUB:
        case LexemType.LEXEM_OP_SHL:
        case LexemType.LEXEM_OP_SHR:
        case LexemType.LEXEM_OP_SAL:
        case LexemType.LEXEM_OP_SAR:
        case LexemType.LEXEM_OP_CMP:
        {
          // console.log('createInstructionSet. xor... cmp operation.');
          // this.debugConsolePrintObject('operandDst: ', operandDst);
          // this.debugConsolePrintObject('operandSrc: ', operandSrc);
          if (operandSrc.m_operandType === OperandType.OPERAND_NA) {
            const strA = `Error syntax in line [${lineNumber + 1}]`;
            const strB = `Source code = ${strLine}`;
            const strC = 'Should be 2 operands\n';
            this.m_strErr = `${strA} ${strB} ${strC}`;
            console.log(`Compler. createInstructionSet. should be 2 operands: ${strLine}`);
            return false;
          }
          if (operandDst.m_operandType === OperandType.OPERAND_IMMEDIATE_INT) {
            const strA = `Error syntax in line [${lineNumber + 1}]`;
            const strB = `Source code = ${strLine}`;
            const strC = 'Destination operand cant be immediate\n';
            this.m_strErr = `${strA} ${strB} ${strC}`;
            console.log(`Compler. createInstructionSet. src op should be imm int: ${strLine}`);
            return false;
          }
          if ((operandDst.m_operandType === OperandType.OPERAND_MEMORY) && (operandSrc.m_operandType === OperandType.OPERAND_MEMORY) ) {
            const strA = `Error syntax in line [${lineNumber + 1}]`;
            const strB = `Source code = ${strLine}`;
            const strC = 'Destination and source operand cant be memory\n';
            this.m_strErr = `${strA} ${strB} ${strC}`;
            console.log(`Compler. createInstructionSet. dest and src cant be memory: ${strLine}`);
            return false;
          }
          if ((instr.m_instruction === LexemType.LEXEM_OP_SHL) ||
            (instr.m_instruction === LexemType.LEXEM_OP_SHR) ||
            (instr.m_instruction === LexemType.LEXEM_OP_SAL) ||
            (instr.m_instruction === LexemType.LEXEM_OP_SAR) ) {

            if (operandSrc.m_operandType === OperandType.OPERAND_IMMEDIATE_INT) {
              const IMM_MAX = 31;
              if ( (operandSrc.m_immediateInt < 0) || (operandSrc.m_immediateInt > IMM_MAX) ) {
                const strA = `Error syntax in line [${lineNumber + 1}]`;
                const strB = `Source code = ${strLine}`;
                const strC = 'Invalid immediate counter for shift operations. Should be in [0..31]\n';
                this.m_strErr = `${strA} ${strB} ${strC}`;
                console.log(`Compler. createInstructionSet. bad counter for shift: ${strLine}`);
                return false;
              }
            } else if (operandSrc.m_operandType === OperandType.OPERAND_REGISTER) {
              if (instr.m_operandSrc.m_register !== Register.REG_CL) {
                const strA = `Error syntax in line [${lineNumber + 1}]`;
                const strB = `Source code = ${strLine}`;
                const strC = 'Only CL register is allowed as source operand for shift instructions\n';
                console.log(`Compler. createInstructionSet. should be CL : ${strLine}`);
                this.m_strErr = `${strA} ${strB} ${strC}`;
                return false;
              }
            } else {
              const strA = `Error syntax in line [${lineNumber + 1}]`;
              const strB = `Source code = ${strLine}`;
              const strC = 'Source operand should be immediate int or register CL\n';
              this.m_strErr = `${strA} ${strB} ${strC}`;
              console.log(`Compler. createInstructionSet. source shold be imm or CL: ${strLine}`);
              return false;
            }
          }
          break;
        } // case XOR, AND, OR, MOV, ...
        default: {
          console.log('Forgotten implementation');
        } // of default case
      } // switch

      // finally add instruction to set
      // this.debugConsolePrintObject('Add instruction: ', instr);
      instrSet.m_instructions.push(instr);

      // const numInstrInSet = instrSet.m_instructions.length;
      // console.log(`Num instructions in set = ${numInstrInSet}`);
    } // for (lineNumber)
    return true;
  }

  public preprocessCode(strCodeSource) {
    const prep = new Preprocessor();
    const strWithoutComments = prep.removeComments(strCodeSource);
    if (strWithoutComments.length === 0) {
      this.m_strErr = 'Error duting remove comments';
      return strWithoutComments;
    }
    const isGoodCharsInCode = prep.checkInvalidCharacters(strWithoutComments);
    if (!isGoodCharsInCode) {
      console.log('Comipler.createCode: bad chars found');
      this.m_strErr = 'Comipler.createCode: bad chars found';
      return '';
    }
    const isGoodIdentLen = prep.checkMaxIdentifierLength(strWithoutComments);
    if (!isGoodIdentLen) {
      console.log('Comipler.createCode: too long identifiers found');
      this.m_strErr = 'Comipler.createCode: too long identifiers found';
      return '';
    }
    const isGoodDigLabels = prep.checkDigitalLabels(strWithoutComments);
    if (!isGoodDigLabels) {
      console.log('Comipler.createCode: has bad digital labels');
      this.m_strErr = 'Comipler.createCode: has bad digital labels';
      return '';
    }
    const strLabelsReplacedToInts = prep.replaceLabelsToInts(strWithoutComments);
    this.m_strErr = '';
    return strLabelsReplacedToInts;
  }

  public createCode(strTaskCode, instrSet) {
    const strPrepCode = this.preprocessCode(strTaskCode);
    if (strPrepCode.length < 1) {
      return false;
    }
    // console.log(`Compiler.createCode. After prerocessing = ${strPrepCode}`);
    const res = this.createInstructionSet(strPrepCode, instrSet);
    return res;
  }
}

