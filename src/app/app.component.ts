import { Component, ViewChild } from '@angular/core';
import { Preprocessor } from './core/preprocessor';
// import { Service } from './service';

import { VirtualMachineComponent } from './virtual-machine/virtual-machine.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  // *****************************
  // Data
  // *****************************

  public m_strTitle: string;

  public m_clickMessage: string;
  public m_clickCounter: number;
  public m_strInput: string;
  public m_strInputPreprocessed: string;

  private m_fileToOpen: File = null;

  // ******************************
  // Child components
  // ******************************
  @ViewChild(VirtualMachineComponent)
  m_virtualMachine: VirtualMachineComponent;

  // *****************************
  // Methods
  // *****************************

  constructor() {
    // const tests = require('../../assets/test.json');
    // this.m_service = new Service();

    this.m_strTitle = 'Виртуальная машина ассемблера';

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
  openLocal() {
    // console.log('openLocal...');
  }
  onOpenedFiles(files: FileList) {
    this.m_fileToOpen = files.item(0);
    const fName = this.m_fileToOpen.name;
    // console.log(`onOpenedFiles... name = ${fName}`);
    const fileReader = new FileReader();
    fileReader.onload = (evt: Event) => {
      const strFile = fileReader.result.toString();
      const lenFile =   strFile.length;
      // console.log(`File content = ${typeof strFile}, file len = ${lenFile}`);
      const MAX_FILE_LEN = 4096;
      if (lenFile > MAX_FILE_LEN) {
        const strErrToLong = `Too large file. Size = ${lenFile}`;
        console.log(strErrToLong);
        this.m_virtualMachine.setSourceError(strErrToLong);
        return;
      }

      // assign loaded text to virt machine
      this.m_virtualMachine.setSourceCode(strFile);
    };
    fileReader.readAsText(this.m_fileToOpen);
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
