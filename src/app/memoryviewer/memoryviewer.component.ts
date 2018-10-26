// ********************************************************
// Imports
// ********************************************************

import { Component, OnInit } from '@angular/core';

import { RandomComponent } from '../random/random.component';

// ********************************************************
// Consts
// ********************************************************


// **********************************************************

@Component({
  selector: 'app-memoryviewer',
  templateUrl: './memoryviewer.component.html',
  styleUrls: ['./memoryviewer.component.css']
})
export class MemoryViewerComponent implements OnInit {
  // ********************************************************
  // Const
  // ********************************************************

  public static readonly NUM_VIEW_ELEMS = 64;

  // ********************************************************
  // Data
  // ********************************************************

  public m_title: string;
  public m_strOffset: string;

  // each element is byte: [0..255]
  public m_data: number[];

  // only part of m_data [64 elements only!]
  public m_dataView: number[];

  // for random generator
  private m_random: RandomComponent;

  // ********************************************************
  // Methods
  // ********************************************************

  constructor() {
    this.m_title = 'Память (дес)';
    this.m_strOffset = 'Смещение (байт)';

    this.m_data = new Array(MemoryViewerComponent.NUM_VIEW_ELEMS);
    this.m_dataView = new Array(MemoryViewerComponent.NUM_VIEW_ELEMS);

    this.m_random = new RandomComponent();

    const MAX_BYTE_VAL = 255;
    this.m_random.initRandomSeed();
    for (let i = 0; i < MemoryViewerComponent.NUM_VIEW_ELEMS; i++) {
      // tslint:disable-next-line:no-bitwise
      const s = (this.m_random.getNextRandomInt() & MAX_BYTE_VAL);
      this.m_data[i] = s;
      this.m_dataView[i] = s;
    }
  }
  ngOnInit() {
  }

  public setData(dataArrayBytes, dataSize) {
    this.m_data = new Array(dataSize);
    for (let i = 0; i < dataSize; i++) {
      this.m_data[i] = dataArrayBytes[i];
      if (i <= MemoryViewerComponent.NUM_VIEW_ELEMS) {
        this.m_dataView[i] = dataArrayBytes[i];
      }
    }
  }

}
