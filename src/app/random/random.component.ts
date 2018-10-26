// ********************************************************
// Imports
// ********************************************************

import { Component, OnInit } from '@angular/core';

// **********************************************************

@Component({
  selector: 'app-random',
  templateUrl: './random.component.html',
  styleUrls: ['./random.component.css']
})
export class RandomComponent implements OnInit {

  // ********************************************************
  // Const
  // ********************************************************

  // ********************************************************
  // Data
  // ********************************************************

  // for random generator
  private m_seedRandom: number;

  constructor() {
    this.initRandomSeed();
  }

  ngOnInit() {
  }

  public initRandomSeed() {
    const MAGIC_INIT = 0xACE1;
    this.m_seedRandom = MAGIC_INIT;
  }

  public getNextRandomInt() {
    const NUM_2 = 2;
    const NUM_3 = 3;
    const NUM_5 = 5;
    const NUM_15 = 15;
    let lfsr = this.m_seedRandom;
    // tslint:disable-next-line:no-bitwise
    const bit = ((lfsr >> 0) ^ (lfsr >> NUM_2) ^ (lfsr >> NUM_3) ^ (lfsr >> NUM_5) ) & 1;
    // tslint:disable-next-line:no-bitwise
    lfsr = (lfsr >> 1) | (bit << NUM_15);
    this.m_seedRandom = lfsr;
    return this.m_seedRandom;
  }
}
