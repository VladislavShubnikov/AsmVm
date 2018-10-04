import { LexemType } from './lexemtype';

class LexDesc {

  m_keyword: string;
  m_type: LexemType;

  constructor(keyw, tp) {
    this.m_keyword = keyw;
    this.m_type = tp;
  }
}

export class LexemParser {

  m_lexemDesc: LexDesc[];

  constructor() {
    this.m_lexemDesc = new Array();
    this.m_lexemDesc.push(new LexDesc(';', LexemType.LEXEM_SEMICOLON));
    this.m_lexemDesc.push(new LexDesc(':', LexemType.LEXEM_COLON));
    this.m_lexemDesc.push(new LexDesc(',', LexemType.LEXEM_COMMA));

    this.m_lexemDesc.push(new LexDesc('.', LexemType.LEXEM_DOT));
    this.m_lexemDesc.push(new LexDesc('[', LexemType.LEXEM_BRACKET_OPEN));
    this.m_lexemDesc.push(new LexDesc(']', LexemType.LEXEM_BRACKET_CLOSE));
    this.m_lexemDesc.push(new LexDesc('+', LexemType.LEXEM_PLUS));
    this.m_lexemDesc.push(new LexDesc('-', LexemType.LEXEM_MINUS));
    this.m_lexemDesc.push(new LexDesc('*', LexemType.LEXEM_MUL));
    this.m_lexemDesc.push(new LexDesc('/', LexemType.LEXEM_DIV));

    this.m_lexemDesc.push(new LexDesc('ptr',    LexemType.LEXEM_PTR));
    this.m_lexemDesc.push(new LexDesc('byte',   LexemType.LEXEM_BYTE));
    this.m_lexemDesc.push(new LexDesc('word',   LexemType.LEXEM_WORD));
    this.m_lexemDesc.push(new LexDesc('dword',  LexemType.LEXEM_DWORD));

    this.m_lexemDesc.push(new LexDesc('nop',    LexemType.LEXEM_OP_NOP));
    this.m_lexemDesc.push(new LexDesc('xor',    LexemType.LEXEM_OP_XOR));
    this.m_lexemDesc.push(new LexDesc('and',    LexemType.LEXEM_OP_AND));
    this.m_lexemDesc.push(new LexDesc('or',     LexemType.LEXEM_OP_OR));
    this.m_lexemDesc.push(new LexDesc('not',    LexemType.LEXEM_OP_NOT));
    this.m_lexemDesc.push(new LexDesc('neg',    LexemType.LEXEM_OP_NEG));
    this.m_lexemDesc.push(new LexDesc('mov',    LexemType.LEXEM_OP_MOV));
    this.m_lexemDesc.push(new LexDesc('add',    LexemType.LEXEM_OP_ADD));
    this.m_lexemDesc.push(new LexDesc('sub',    LexemType.LEXEM_OP_SUB));
    this.m_lexemDesc.push(new LexDesc('mul',    LexemType.LEXEM_OP_MUL));
    this.m_lexemDesc.push(new LexDesc('div',    LexemType.LEXEM_OP_DIV));
    this.m_lexemDesc.push(new LexDesc('inc',    LexemType.LEXEM_OP_INC));
    this.m_lexemDesc.push(new LexDesc('dec',    LexemType.LEXEM_OP_DEC));
    this.m_lexemDesc.push(new LexDesc('shl',    LexemType.LEXEM_OP_SHL));
    this.m_lexemDesc.push(new LexDesc('shr',    LexemType.LEXEM_OP_SHR));
    this.m_lexemDesc.push(new LexDesc('sal',    LexemType.LEXEM_OP_SAL));
    this.m_lexemDesc.push(new LexDesc('sar',    LexemType.LEXEM_OP_SAR));

    this.m_lexemDesc.push(new LexDesc('cmp',    LexemType.LEXEM_OP_CMP));
    this.m_lexemDesc.push(new LexDesc('push',   LexemType.LEXEM_OP_PUSH));
    this.m_lexemDesc.push(new LexDesc('pop',    LexemType.LEXEM_OP_POP));
    this.m_lexemDesc.push(new LexDesc('jmp',    LexemType.LEXEM_OP_JMP));
    this.m_lexemDesc.push(new LexDesc('jnz',    LexemType.LEXEM_OP_JNZ));
    this.m_lexemDesc.push(new LexDesc('jz',     LexemType.LEXEM_OP_JZ));
    this.m_lexemDesc.push(new LexDesc('js',     LexemType.LEXEM_OP_JS));
    this.m_lexemDesc.push(new LexDesc('jns',    LexemType.LEXEM_OP_JNS));
    this.m_lexemDesc.push(new LexDesc('jc',     LexemType.LEXEM_OP_JC));
    this.m_lexemDesc.push(new LexDesc('jnc',    LexemType.LEXEM_OP_JNC));
    this.m_lexemDesc.push(new LexDesc('jne',    LexemType.LEXEM_OP_JNE));
    this.m_lexemDesc.push(new LexDesc('je',     LexemType.LEXEM_OP_JE));
    this.m_lexemDesc.push(new LexDesc('jge',    LexemType.LEXEM_OP_JGE));
    this.m_lexemDesc.push(new LexDesc('jnge',   LexemType.LEXEM_OP_JNGE));
    this.m_lexemDesc.push(new LexDesc('jg',     LexemType.LEXEM_OP_JG));
    this.m_lexemDesc.push(new LexDesc('jng',    LexemType.LEXEM_OP_JNG));
    this.m_lexemDesc.push(new LexDesc('jbe',    LexemType.LEXEM_OP_JBE));
    this.m_lexemDesc.push(new LexDesc('jb',     LexemType.LEXEM_OP_JB));
    this.m_lexemDesc.push(new LexDesc('jnb',    LexemType.LEXEM_OP_JNB));
    this.m_lexemDesc.push(new LexDesc('jnbe',   LexemType.LEXEM_OP_JNBE));
    this.m_lexemDesc.push(new LexDesc('jle',    LexemType.LEXEM_OP_JLE));
    this.m_lexemDesc.push(new LexDesc('jl',     LexemType.LEXEM_OP_JL));
    this.m_lexemDesc.push(new LexDesc('jnl',    LexemType.LEXEM_OP_JNL));
    this.m_lexemDesc.push(new LexDesc('ja',     LexemType.LEXEM_OP_JA));
    this.m_lexemDesc.push(new LexDesc('jna',    LexemType.LEXEM_OP_JNA));
    this.m_lexemDesc.push(new LexDesc('jae',    LexemType.LEXEM_OP_JAE));
    this.m_lexemDesc.push(new LexDesc('jnae',   LexemType.LEXEM_OP_JNAE));

    this.m_lexemDesc.push(new LexDesc('eax',    LexemType.LEXEM_REG_EAX));
    this.m_lexemDesc.push(new LexDesc('ebx',    LexemType.LEXEM_REG_EBX));
    this.m_lexemDesc.push(new LexDesc('ecx',    LexemType.LEXEM_REG_ECX));
    this.m_lexemDesc.push(new LexDesc('cl',     LexemType.LEXEM_REG_CL));
    this.m_lexemDesc.push(new LexDesc('edx',    LexemType.LEXEM_REG_EDX));
    this.m_lexemDesc.push(new LexDesc('ebp',    LexemType.LEXEM_REG_EBP));
    this.m_lexemDesc.push(new LexDesc('esp',    LexemType.LEXEM_REG_ESP));
    this.m_lexemDesc.push(new LexDesc('esi',    LexemType.LEXEM_REG_ESI));
    this.m_lexemDesc.push(new LexDesc('edi',    LexemType.LEXEM_REG_EDI));
    this.m_lexemDesc.push(new LexDesc('eip',    LexemType.LEXEM_REG_EIP));

  } // end of constructor

  isCharacter(sym) {
    const retVal = (((sym >= 'a') && (sym <= 'z')) || ((sym >= 'A') && (sym <= 'Z')) || (sym === '_'));
    return retVal;
  }

  isDigit(sym) {
    const retVal = ((sym >= '0') && (sym <= '9'));
    return retVal;
  }

  public getLexemByString(strSrc) {
    const strLow = strSrc.toLowerCase();
    const strLen = strLow.length;
    const numKeywords = this.m_lexemDesc.length;
    let i;
    for (i = 0; i < numKeywords; i++) {
      const strKeyw  = this.m_lexemDesc[i].m_keyword;
      const typeKeyw = this.m_lexemDesc[i].m_type;
      if (strKeyw.length === strLen) {
        if (strKeyw === strLow) {
          return typeKeyw;
        }
      }
    } // for (i)
    // check is integer constant
    let foundDigit    = false;
    let foundNonDigit = false;
    for (i = 0; (i < strLen) && !foundNonDigit; i++) {
      const sym = strLow.charAt(i);
      if ( (sym >= '0') &&  (sym <= '9')) {
        foundDigit = true;
      } else {
        foundNonDigit = true;
      }
    }
    if (foundDigit && !foundNonDigit) {
      return LexemType.LEXEM_CONST_INT;
    }
    // check is identifier
    let foundCharIdent = false;
    let foundBad = false;
    for (i = 0; (i < strLen); i++) {
      const sym = strLow.charAt(i);
      // 0: can by char
      // 1,2,... : can be char or digit
      if (i === 0) {
        if (this.isCharacter(sym)) {
           foundCharIdent = true;
        } else {
          foundBad = true;
        }
      } else {
        if (this.isCharacter(sym) || this.isDigit(sym)) {
          foundCharIdent = true;
        } else {
          foundBad = true;
        }
      }
    }
    if (foundCharIdent && !foundBad) {
      return LexemType.LEXEM_IDENTIFIER;
    }

    // pessimistic return
    return LexemType.LEXEM_NA;
  }
  public getStringByLexem(lexType) {
    if (lexType === LexemType.LEXEM_IDENTIFIER) {
      return 'LEXEM_IDENTIFIER';
    }
    if (lexType === LexemType.LEXEM_CONST_INT) {
      return 'LEXEM_CONST_INT';
    }
    if (lexType === LexemType.LEXEM_CONST_FLOAT) {
      return 'LEXEM_CONST_FLOAT';
    }
    const numTypes = this.m_lexemDesc.length;
    for (let i = 0; i < numTypes; i++) {
      if (this.m_lexemDesc[i].m_type === lexType) {
        const keyw = this.m_lexemDesc[i].m_keyword;
        return keyw;
      }
    }
    return 'UNDEFINED';
  }
}
