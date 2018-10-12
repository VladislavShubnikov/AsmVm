import { Component } from '@angular/core';
import { Preprocessor } from './core/preprocessor';
// import { Service } from './service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  // *****************************
  // Data
  // *****************************
  m_title: string;
  m_clickMessage: string;
  m_clickCounter: number;
  m_strInput: string;
  m_strInputPreprocessed: string;
  // m_service: Service;

  // *****************************
  // Methods
  // *****************************

  constructor() {
    // const tests = require('../../assets/test.json');
    // this.m_service = new Service();

    this.m_title = 'Assembler virtual machine';
    this.m_clickMessage = 'Before click';
    this.m_clickCounter = 0;
    this.m_strInput = 'LabelAgain:\n\
      cmp ECX, 0\n\
      jz LabelQuit\n\
      ; this is loop example \n\
      add EDX, EBX\n\
      dec ECX\n\
      jmp LabelAgain\n\
      LabelQuit:\n\
      xor EAX, EAX\n\
    ';
    this.m_strInputPreprocessed = '';
  }
  onClickMe() {
    // this.m_clickMessage = 'You have clicked!';
    this.m_clickCounter++;
    this.m_clickMessage = `You clicked ${this.m_clickCounter} times`;
    // invoke preprocessor
    const prep = new Preprocessor();
    const strWoComments = prep.removeComments(this.m_strInput);
    const goodChars = prep.checkInvalidCharacters(strWoComments);
    if (goodChars) {
      const goodIdsLen = prep.checkMaxIdentifierLength(strWoComments);
      if (goodIdsLen) {
        const goodDigLabels = prep.checkDigitalLabels(strWoComments);
        if (goodDigLabels) {
          const strRemovedLabels = prep.replaceLabelsToInts(strWoComments);
          this.m_strInputPreprocessed = strRemovedLabels;
        } else {
          this.m_strInputPreprocessed = prep.m_strErr;
        }
      } else {
        this.m_strInputPreprocessed = prep.m_strErr;
      }
    } else {
      this.m_strInputPreprocessed = prep.m_strErr;
    }
  }
  onKey(evt: any) {
    this.m_strInput = evt.target.value;
  }
}
