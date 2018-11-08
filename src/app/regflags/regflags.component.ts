import { Component, OnInit } from '@angular/core';
import { RegFlags } from '../core/regflags';

const NUM_VIS_REG_FLAGS = 7;

@Component({
  selector: 'app-regflags',
  templateUrl: './regflags.component.html',
  styleUrls: ['./regflags.component.css']
})
export class RegflagsComponent implements OnInit {
  // ********************************************************
  // Const
  // ********************************************************

  // ********************************************************
  // Data
  // ********************************************************

  public m_strRegisters: string;
  public m_bits: number[];
  public m_flagNames: string[];
  public m_registrers: number;

  // ********************************************************
  // Methods
  // ********************************************************

  constructor() {
    this.m_strRegisters = 'Регистры';
    this.m_flagNames = new Array(NUM_VIS_REG_FLAGS);
    this.m_bits = new Array(NUM_VIS_REG_FLAGS);
    let i;
    for (i = 0; i < NUM_VIS_REG_FLAGS; i++) {
      this.m_bits[i] = 0;
    }
    i = 0;
    this.m_flagNames[i++] = 'CF';
    this.m_flagNames[i++] = 'PF';
    this.m_flagNames[i++] = 'AF';
    this.m_flagNames[i++] = 'ZF';
    this.m_flagNames[i++] = 'SF';
    this.m_flagNames[i++] = 'DF';
    this.m_flagNames[i++] = 'OF';
    this.m_registrers = 0;
  }

  ngOnInit() {
  }

  public isSelected(indexBit: number) {
    const isSet = (this.m_bits[indexBit] !== 0) ? true : false;
    return isSet;
  }

  public setFlags(regBits: number) {
    this.m_registrers = regBits;
    let i;
    let j = 0;
    const MAX_BITS = 16;
    for (i = 0; i < MAX_BITS; i++) {
      // tslint:disable-next-line:no-bitwise
      const mask = 1 << i;
      if (i === RegFlags.BIT_CARRY) {
        // tslint:disable-next-line:no-bitwise
        this.m_bits[j++] = ((this.m_registrers & mask) !== 0) ? 1 : 0;
      }
      if (i === RegFlags.BIT_PARITY) {
        // tslint:disable-next-line:no-bitwise
        this.m_bits[j++] = ((this.m_registrers & mask) !== 0) ? 1 : 0;
      }
      if (i === RegFlags.BIT_ADJUST) {
        // tslint:disable-next-line:no-bitwise
        this.m_bits[j++] = ((this.m_registrers & mask) !== 0) ? 1 : 0;
      }
      if (i === RegFlags.BIT_ZERO) {
        // tslint:disable-next-line:no-bitwise
        this.m_bits[j++] = ((this.m_registrers & mask) !== 0) ? 1 : 0;
      }
      if (i === RegFlags.BIT_SIGN) {
        // tslint:disable-next-line:no-bitwise
        this.m_bits[j++] = ((this.m_registrers & mask) !== 0) ? 1 : 0;
      }
      if (i === RegFlags.BIT_DIRECTION) {
        // tslint:disable-next-line:no-bitwise
        this.m_bits[j++] = ((this.m_registrers & mask) !== 0) ? 1 : 0;
      }
      if (i === RegFlags.BIT_OVERFLOW) {
        // tslint:disable-next-line:no-bitwise
        this.m_bits[j++] = ((this.m_registrers & mask) !== 0) ? 1 : 0;
      }
    } // for (i)
    // console.log(`Regflags.setFlags. bits = ${this.m_bits}`);
  }

}
