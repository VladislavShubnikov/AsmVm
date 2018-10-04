import { LexemType } from './lexemtype';


export class Lexem {

  // ******************************************************
  // Data
  // ******************************************************
  m_type:         LexemType;
  m_identifier:   string;
  m_constInt:     number;
  m_constFloat:   number;

  // ******************************************************
  // Methods
  // ******************************************************
  constructor() {
    this.m_type         = LexemType.LEXEM_NA;
    this.m_identifier   = '';
    this.m_constInt     = 0;
    this.m_constFloat   = 0.0;
  }
  isRegister() {
    const isReg = (this.m_type >= LexemType.LEXEM_REG_EAX) && (this.m_type <= LexemType.LEXEM_REG_EDI);
    return isReg;
  }
}
