import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.css']
})


export class ConsoleComponent implements OnInit {

  // ********************************************************
  // Const
  // ********************************************************
  public static readonly NUM_CONSOLE_LINES = 5;

  // ********************************************************
  // Data
  // ********************************************************

  public m_strClearConsole: string;
  public m_strConsoleTitle: string;

  public m_consoleText: string[];
  private m_numLines: number;

  // ********************************************************
  // Methods
  // ********************************************************

  constructor() {
    this.m_strConsoleTitle = 'Консоль';
    this.m_strClearConsole = 'Очистить консоль';

    this.m_consoleText = new Array(ConsoleComponent.NUM_CONSOLE_LINES);
    this.m_numLines = 0;
    // test
    this.clear();
    const STR_CONSOLE_HELLO = 'Консоль запущена...';
    this.addString(STR_CONSOLE_HELLO);
    this.addString('Line 2');
    this.addString('Line 3');
    this.addString('Line 4');
  }

  ngOnInit() {
  }

  public clear() {
    for (let i = 0; i < ConsoleComponent.NUM_CONSOLE_LINES; i++) {
      this.m_consoleText[i] = '';
    }
    this.m_numLines = 0;
  }
  public addString(str) {
    if (typeof str !== 'string') {
      console.log(`ConsoleComponent. addString. Bad input argument = ${str}`);
    }
    if (this.m_numLines < ConsoleComponent.NUM_CONSOLE_LINES) {
      this.m_consoleText[this.m_numLines] = str;
      this.m_numLines++;
    } else {
      for (let i = 0; i < ConsoleComponent.NUM_CONSOLE_LINES - 1; i++) {
        this.m_consoleText[i] = this.m_consoleText[i + 1];
      }
      this.m_consoleText[ConsoleComponent.NUM_CONSOLE_LINES - 1] = str;
    }

  }

  onClickClearConsole() {
    console.log('ConsoleComponent. onClickClearConsole()');
    this.clear();
    // this.addString('Wowwwww');
  } // end of onClickClearConsole
}
