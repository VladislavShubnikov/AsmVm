import { Register } from './register';
import { RegisterParser } from './registerparser';

export class MemoryDesc {
  // ********************************************************
  // Data
  // ********************************************************

  m_flagRegBase:    boolean;
  m_flagRegIndex:   boolean;
  m_flagImmScale:   boolean;
  m_flagImmAdd:     boolean;

  m_registerBase:   number;
  m_registerIndex:  number;
  m_immScale:       number;
  m_immAdd:         number;

  // ********************************************************
  // Methods
  // ********************************************************
  constructor() {
    this.m_flagRegBase    = false;
    this.m_flagRegIndex   = false;
    this.m_flagImmScale   = false;
    this.m_flagImmAdd     = false;

    this.m_registerBase   = Register.REG_NA;
    this.m_registerIndex  = Register.REG_NA;
    this.m_immScale       = 1;
    this.m_immAdd         = 0;
  }
  setInvalid() {
    this.m_flagRegBase    = false;
    this.m_flagRegIndex   = false;
    this.m_flagImmScale   = false;
    this.m_flagImmAdd     = false;

    this.m_registerBase   = Register.REG_NA;
    this.m_registerIndex  = Register.REG_NA;
    this.m_immScale       = 1;
    this.m_immAdd         = 0;
  }
  getString() {
    let strOut = '[';
    const regParser = new RegisterParser();
    if (this.m_flagRegBase) {
      const strRegBase = regParser.getString(this.m_registerBase);
      strOut += strRegBase;
    }
    if (this.m_flagRegIndex) {
      const strRegIndex = regParser.getString(this.m_registerIndex);
      strOut += ' + ';
      strOut += strRegIndex;
    }
    if (this.m_flagImmScale) {
      strOut += ' * ';
      strOut += `${this.m_immScale}`;
    }
    if (this.m_flagImmAdd) {
      strOut += ' + ';
      strOut += `${this.m_immAdd}`;
    }
    /*
    strOut += `flagRegBase = ${this.m_flagRegBase}. `;
    strOut += `flagRegIndex = ${this.m_flagRegIndex}. `;
    strOut += `flagImmScale = ${this.m_flagImmScale}. `;
    strOut += `flagImmAdd = ${this.m_flagImmAdd}. `;
    strOut += `register base = ${this.m_registerBase}. `;
    strOut += `register index = ${this.m_registerIndex}. `;
    strOut += `imm scale = ${this.m_immScale}. `;
    strOut += `imm add = ${this.m_immAdd}. `;
    */
    strOut += ']';
    return strOut;
  }
}
