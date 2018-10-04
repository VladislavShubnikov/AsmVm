// ********************************************************
// Registers: set of registers CPU
// ********************************************************

import { Component, OnInit } from '@angular/core';
import { Register } from '../core/register';

@Component({
  selector: 'app-registers',
  templateUrl: './registers.component.html',
  styleUrls: ['./registers.component.css']
})

export class RegistersComponent implements OnInit {
  // ********************************************************
  // Data
  // ********************************************************
  m_registersCpu:     number[];
  m_registersCpuHex:  string[];

  // ********************************************************
  // Methods
  // ********************************************************

  constructor() {
    this.m_registersCpu = new Array(Register.REG_COUNT);
    this.m_registersCpuHex = new Array(Register.REG_COUNT);
    let i;
    for (i = 0; i < Register.REG_COUNT; i++) {
      this.m_registersCpu[i] = 0;
      this.m_registersCpuHex[i] = '00000000';
    }
    const INIT_STACK_SIZE = 256;
    this.m_registersCpu[Register.REG_ESP] = INIT_STACK_SIZE;
    // convert number to string
    for (i = 0; i < Register.REG_COUNT; i++) {
      this.m_registersCpuHex[i] = this.getHexStringFromDec(this.m_registersCpu[i]);
    }
  }
  getHexStringFromDec(valDec) {
    if (valDec < 0) {
      const NEG_MAG = 0xFFFFFFFF;
      valDec = NEG_MAG + valDec + 1;
    }
    // add leading 00 if need
    const HEX = 16;
    let strRes = valDec.toString(HEX).toUpperCase();
    const len = strRes.length;
    const MAX_LEN = 8;
    while (strRes.length < MAX_LEN) {
      strRes = '0' + strRes;
    }
    strRes = '0x' + strRes;
    return strRes;
  }

  ngOnInit() {
  }

}
