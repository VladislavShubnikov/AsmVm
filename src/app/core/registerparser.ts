import { Register } from './register';

export class RegisterParser {
  constructor() {
  }
  getString(regIndex) {
    const strArrRegistersCpu = [
      'EAX', 'EBX', 'ECX', 'CL', 'EDX', 'EBP', 'ESP', 'ESI', 'EDI'
    ];
    const numnRegs = strArrRegistersCpu.length;
    if ((regIndex < 0) || (regIndex >= numnRegs)) {
      return '!!! wrong register index';
    }
    const strRegName = strArrRegistersCpu[regIndex];
    return strRegName;
  }
}
