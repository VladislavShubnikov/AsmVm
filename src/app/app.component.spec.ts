import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Preprocessor } from './core/preprocessor';
import { Compiler } from './core/compiler';
import { Operand } from './core/operand';
import { OperandType } from './core/operandtype';
import { LexemType } from './core/lexemtype';
import { LexemParser } from './core/lexemparser';
// import * as data from '../assets/test.json';


describe('AppComponent', () => {
  /*
  it('test read JSON local from assets', () => {
    const dataArray = (<any>data).default;
    // const dataArray = (<any>data);
    const numDatas = dataArray.length;
    expect(numDatas).toBeGreaterThan(1);
    let i;
    for (i = 0; i < numDatas; i++) {
      const strFromJson = dataArray[i].code;
      const idFromJson = dataArray[i].id;
      const MIN_ID = 500;
      const MIN_STLEN = 6;
      expect(idFromJson).toBeGreaterThan(MIN_ID);
      expect(strFromJson.length).toBeGreaterThan(MIN_STLEN);
    }
  });
  */
  it('check preprocessor remove comments', () => {
    const prep = new Preprocessor();
    const strA = '; some comment here\r\ndec EAX';
    const strPreA = prep.removeComments(strA);
    const strB = '; some comment here';
    const strPreB = prep.removeComments(strB);
    const strC = 'add EAX, 98\r\ndec EDX';
    const strPreC = prep.removeComments(strC);
    expect(strPreA).toEqual('\r\ndec EAX');
    expect(strPreB).toEqual('');
    expect(strPreC).toEqual(strC);
  });

  it('check preprocessor invalid characters', () => {
    const prep = new Preprocessor();
    const strA = '; some comment here\r\ndec EAX';
    const strB = 'mov EAX, 4\r\ndec ECX\r\n%^&*#$%Обана';
    const isValidA = prep.checkInvalidCharacters(strA);
    const isValidB = prep.checkInvalidCharacters(strB);
    expect(isValidA).toEqual(true);
    expect(isValidB).toEqual(false);
    console.log(`Expected error message = ${prep.m_strErr}`);
  });

  it('check preprocessor check next delimiter', () => {
    const prep = new Preprocessor();
    const strA = 'ABC DEF';
    const strB = 'aaaaabbbnsbndbnn';
    const strC = 'aaa bbb ccc ddd eee';

    const NUM_MIN_ONE = -1;
    const NUM_3 = 3;
    const NUM_4 = 4;
    const NUM_7 = 7;
    const NUM_8 = 8;
    const NUM_14 = 14;
    const NUM_15 = 15;
    const NUM_34 = 34;

    const nextA0 = prep.getNextDelimiter(strA, 0);
    const nextA1 = prep.getNextDelimiter(strA, NUM_4);
    expect(nextA0).toEqual(NUM_3);
    expect(nextA1).toEqual(NUM_7);

    const nextB0 = prep.getNextDelimiter(strB, 0);
    const nextB1 = prep.getNextDelimiter(strB, NUM_34);
    expect(nextB0).toEqual(strB.length);
    expect(nextB1).toEqual(strB.length);

    const nextC0 = prep.getNextDelimiter(strC, 0);
    const nextC1 = prep.getNextDelimiter(strC, NUM_4);
    const nextC2 = prep.getNextDelimiter(strC, NUM_14);
    expect(nextC0).toEqual(NUM_3);
    expect(nextC1).toEqual(NUM_7);
    expect(nextC2).toEqual(NUM_15);
  });

  it('check preprocessor checkMaxIdentifierLength', () => {
    const prep = new Preprocessor();
    const strA = 'mov EBX, 6543445\r\nmov ECX, [ESI + 0786732]\r\nmov CL, 298';
    const strB = 'mov EAX, [EBX + 01245678901234567890123456789012]';
    const goodA = prep.checkMaxIdentifierLength(strA);
    const goodB = prep.checkMaxIdentifierLength(strB);
    expect(goodA).toEqual(true);
    expect(goodB).toEqual(false);
    console.log(`Expected error message = ${prep.m_strErr}`);
  });

  it('check lexemParser', () => {
    const lexParser = new LexemParser();
    const strA = ';';
    const strB = ':';
    const strC = 'Add';
    const strD = 'identSome';
    const strE = '28736';
    const strF = '';
    const lexemA = lexParser.getLexemByString(strA);
    const lexemB = lexParser.getLexemByString(strB);
    const lexemC = lexParser.getLexemByString(strC);
    const lexemD = lexParser.getLexemByString(strD);
    const lexemE = lexParser.getLexemByString(strE);
    const lexemF = lexParser.getLexemByString(strF);

    expect(lexemA).toEqual(LexemType.LEXEM_SEMICOLON);
    expect(lexemB).toEqual(LexemType.LEXEM_COLON);
    expect(lexemC).toEqual(LexemType.LEXEM_OP_ADD);
    expect(lexemD).toEqual(LexemType.LEXEM_IDENTIFIER);
    expect(lexemE).toEqual(LexemType.LEXEM_CONST_INT);
    expect(lexemF).toEqual(LexemType.LEXEM_NA);
  });

  it('checkDigitalLabels', () => {
    const prep = new Preprocessor();
    const codeA = '\
      mov EAX, 2765\n\
      LabelA:\n\
      mov EBX, EAX\n\
      dec ECX\n\
      jnz LabelA\n\
    ';
    const codeB = '\
      mov EAX, 2765\n\
      285:\n\
      mov EBX, EAX\n\
      dec ECX\n\
      jnz 285\n\
    ';
    const resA = prep.checkDigitalLabels(codeA);
    const resB = prep.checkDigitalLabels(codeB);
    expect(resA).toEqual(true);
    expect(resB).toEqual(false);
    console.log(`Expected error message = ${prep.m_strErr}`);
  });

  it('replace labels to ints', () => {
    const prep = new Preprocessor();
    const codeA = '\
      mov EAX, 2765\n\
      LabelA:\n\
      mov EBX, EAX\n\
      dec ECX\n\
      jnz LabelA\n\
    ';
    const resA = prep.replaceLabelsToInts(codeA);
    expect(resA.length).toBeGreaterThan(1);
    if (resA.length === 0) {
      console.log(`Replaced error message = ${prep.m_strErr}`);
    }

    const codeFwd = '\
      LabelAgain:\n\
      cmp ECX, 0\n\
      jz LabelQuit\n\
      add EDX, EBX\n\
      dec ECX\n\
      jmp LabelAgain\n\
      LabelQuit:\n\
      xor EAX, EAX\n\
    ';
    const resFwd = prep.replaceLabelsToInts(codeFwd);
    expect(resFwd.length).toBeGreaterThan(1);
    if (resFwd.length === 0) {
      console.log(`Replaced error message = ${prep.m_strErr}`);
    }

    const codeB = '\
      mov EAX, 2765\n\
      LabelGaGa:\n\
      mov EBX, EAX\n\
      dec ECX\n\
      jnz LabelFaFa\n\
    ';
    const resB = prep.replaceLabelsToInts(codeB);
    expect(resB.length).toEqual(0);
    if (resB.length === 0) {
      console.log(`Replaced error message = ${prep.m_strErr}`);
    }
  });

  it('compile build lexems from source text', () => {
    const compiler = new Compiler();
    const codeA = '';
    const codeB = 'mov EAX, 6';
    const codeC = 'dec ECX push ABCABCABC';
    const codeD = 'sub ECX,,[DWORD PTR 12765]';
    const codeE = 'sub A012345678901234567890123456789012345';
    const setA = compiler.buildLexemsFromSourceLine(codeA);
    const setB = compiler.buildLexemsFromSourceLine(codeB);
    const setC = compiler.buildLexemsFromSourceLine(codeC);
    const setD = compiler.buildLexemsFromSourceLine(codeD);
    const setE = compiler.buildLexemsFromSourceLine(codeE);

    expect(setE.length).toEqual(0);
    expect(compiler.m_strErr.length).toBeGreaterThan(1);
    console.log(`COmpiler: expected err msg = [${compiler.m_strErr}]`);

    const NUM_0 = 0;
    const NUM_4 = 4;
    const NUM_9 = 9;
    expect(setA.length).toEqual(NUM_0);
    expect(setB.length).toEqual(NUM_4);
    let i = 0;
    expect(setB[i++].m_type).toEqual(LexemType.LEXEM_OP_MOV);
    expect(setB[i++].m_type).toEqual(LexemType.LEXEM_REG_EAX);
    expect(setB[i++].m_type).toEqual(LexemType.LEXEM_COMMA);
    expect(setB[i++].m_type).toEqual(LexemType.LEXEM_CONST_INT);

    expect(setC.length).toEqual(NUM_4);
    i = 0;
    expect(setC[i++].m_type).toEqual(LexemType.LEXEM_OP_DEC);
    expect(setC[i++].m_type).toEqual(LexemType.LEXEM_REG_ECX);
    expect(setC[i++].m_type).toEqual(LexemType.LEXEM_OP_PUSH);
    expect(setC[i++].m_type).toEqual(LexemType.LEXEM_IDENTIFIER);

    expect(setD.length).toEqual(NUM_9);
    i = 0;
    expect(setD[i++].m_type).toEqual(LexemType.LEXEM_OP_SUB);
    expect(setD[i++].m_type).toEqual(LexemType.LEXEM_REG_ECX);
    expect(setD[i++].m_type).toEqual(LexemType.LEXEM_COMMA);
    expect(setD[i++].m_type).toEqual(LexemType.LEXEM_COMMA);
    expect(setD[i++].m_type).toEqual(LexemType.LEXEM_BRACKET_OPEN);
    expect(setD[i++].m_type).toEqual(LexemType.LEXEM_DWORD);
    expect(setD[i++].m_type).toEqual(LexemType.LEXEM_PTR);
    const ADDR_CONST = 12765;
    expect(setD[i].m_type).toEqual(LexemType.LEXEM_CONST_INT);
    expect(setD[i++].m_constInt).toEqual(ADDR_CONST);
    expect(setD[i++].m_type).toEqual(LexemType.LEXEM_BRACKET_CLOSE);

    /*
    for (let i = 0; i < setB.length; i++) {
      const lex = setB[i];
      console.log(`Lexem. type = ${lex.m_type}, int = ${lex.m_constInt}, ident = ${lex.m_identifier}`);
    }
    */

  });
  it('compile build lexems from source text', () => {
    const compiler = new Compiler();
    const codeA = 'mov EAX, 5\n\
    add ECX, EAX\n\
    dec ECX';
    const lexSetA = compiler.buildLexemsFromSourceLine(codeA);
    compiler.removeFirstElems(lexSetA, 1); // remove instruction mnemonic
    const opDst = new Operand();
    const opSrc = new Operand();
    const resIntGetOpsA = compiler.getOperands(opDst, opSrc, lexSetA);
    expect(resIntGetOpsA).toEqual(true);
    const dstType = opDst.m_operandType;
    const srcType = opSrc.m_operandType;
    expect(dstType).toEqual(OperandType.OPERAND_REGISTER);
    expect(srcType).toEqual(OperandType.OPERAND_IMMEDIATE_INT);
    const srcIntVal = opSrc.m_immediateInt;
    const VAL_MATCH_5 = 5;
    expect(srcIntVal).toEqual(VAL_MATCH_5);
  });

  it('compile build lexems from source text labels', () => {
    const compiler = new Compiler();
    const codeStrA = 'LabelAgain: ';
    const codeStrB = 'jnz LabelAgain';
    const lexSetA = compiler.buildLexemsFromSourceLine(codeStrA);
    const lexSetB = compiler.buildLexemsFromSourceLine(codeStrB);
    const numLexInSetA = lexSetA.length;
    const numLexInSetB = lexSetB.length;
    const TWO = 2;
    expect(numLexInSetA).toEqual(TWO);
    expect(numLexInSetB).toEqual(TWO);
  });

});
