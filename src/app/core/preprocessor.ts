
// ********************************************************
// Imports
// ********************************************************
import { LexemType } from './lexemtype';
import { LexemParser } from './lexemparser';

/** Preprocessing input text: remove comments, etc */
export class Preprocessor {
  // ********************************************************
  // Data
  // ********************************************************
  public m_strErr:       string;
  public m_identifiers:  string[];

  // ********************************************************
  // Methods
  // ********************************************************
  constructor() {
    this.m_strErr = '';
    this.m_identifiers = null;
  }
  /**
   * Remove asm-styled comments from string
   * @param strSrc - Input string.
   * @return String without comments
   */
  removeComments(strSrc) {
    let isComment = false;
    let strDst = '';
    let i;
    for (i = 0; i < strSrc.length; i++) {
      const symSrc = strSrc.charAt(i);
      if (symSrc === ';') {
        isComment = true;
      }
      if ((symSrc === '\r') || (symSrc === '\n')) {
        isComment = false;
      }
      if (!isComment) {
        strDst += symSrc;
      }
    }
    return strDst;
  }

  /**
   * Check is symbol is delimiter
   * @param sym - Input symbol.
   * @return true, if delimiter
   */
  isDelimiter(sym) {
    if ((sym === 0)   || (sym === '\n') ||
      (sym === '\r') ||
      (sym === '\t') ||
      (sym === ' ') ||
      (sym === ',') ||
      (sym === '+') ||
      (sym === '-') ||
      (sym === '*') ||
      (sym === '[') ||
      (sym === ']') ||
      (sym === ';') ||
      (sym === ':')) {
      return true;
      }
    return false;
  }

  /**
   * Check is symbol is character (a..z) or (A..Z) or '_'
   * @param sym - Input symbol.
   * @return true, if character
   */
  isCharacter(sym) {
    const retVal = (((sym >= 'a') && (sym <= 'z')) || ((sym >= 'A') && (sym <= 'Z')) || (sym === '_'));
    return retVal;
  }

  /**
   * Check is symbol is digit (0..9)
   * @param sym - Input symbol.
   * @return true, if digit
   */
  isDigit(sym) {
    const retVal = ((sym >= '0') && (sym <= '9'));
    return retVal;
  }

  /**
   * Check is symbol is space
   * @param sym - Input symbol.
   * @return true, if space type
   */
  isSpace(sym) {
    const retVal = ((sym === 0) || (sym === '\n') || (sym === '\r') || (sym === '\t') || (sym === ' '));
    return retVal;
  }

  /**
   * Check is input string has valid symbols
   * @param strSrc - Input string.
   * @return true, if valid
   */
  checkInvalidCharacters(strSrc) {
    let lineNumber = 1;
    let i;
    for (i = 0; i < strSrc.length; i++) {
      const symSrc = strSrc.charAt(i);
      if (symSrc === '\n') {
        lineNumber++;
      }
      const isDelimiter = this.isDelimiter(symSrc);
      const isChar      = this.isCharacter(symSrc);
      const isDigit     = this.isDigit(symSrc);
      if (!isDelimiter && !isChar && !isDigit) {
        this.m_strErr = `Invalid character '${symSrc}' is found in line # ${lineNumber}`;
        return false;
      }
    }
    return true;
  }
  getNextDelimiter(strSrc, i) {
    const strLen = strSrc.length;
    if (i >= strLen) {
      return strLen;
    }
    let symSrc = strSrc.charAt(i);
    if (this.isDelimiter(symSrc)) {
      return i + 1;
    }
    let j;
    for (j = i + 1; (j < strLen); j++) {
      symSrc = strSrc.charAt(j);
      if (this.isDelimiter(symSrc)) {
          return j;
      }
    }
    return j;
  }
  /**
   * Check is input has max identifier limited length
   * @param strSrc - Input string.
   * @return true, if valid
   */
  checkMaxIdentifierLength(strSrc) {
    const MAX_IDENTIFIER_LEN = 32;
    let strIdent = '';
    let lineNumber = 1;
    for (let i = 0; i < strSrc.length; i++) {
      const symSrc = strSrc.charAt(i);
      if (symSrc === '\n') {
        lineNumber++;
      }
      if (this.isDelimiter(symSrc)) {
        i++;
        continue;
      }
      // now we have character or digit
      const iNext = this.getNextDelimiter(strSrc, i);
      const len = iNext - i;
      if (len >= MAX_IDENTIFIER_LEN) {
        strIdent = '';
        let j;
        const SOME_LESS = 2;
        for (j = 0; j < MAX_IDENTIFIER_LEN - SOME_LESS; j++) {
          strIdent += strSrc.charAt(j);
        }
        const strA = `Too long identifier found in ${lineNumber} line.`;
        const strB = `Bad identifieer: ${strIdent}...`;
        const strC = `Identifier length should be less then ${MAX_IDENTIFIER_LEN}`;
        this.m_strErr = `${strA} ${strB} ${strC}`;
        return false;
      }
      // next lexem
      i = iNext;
    }
    return true;
  }
  /**
   * Check is input has NO digital (should be symbols) labels
   * @param strSrc - Input string.
   * @return true, if valid
   */

  checkDigitalLabels(strSrc) {
    const MAX_IDENTIFIER_LEN = 32;
    let lineNumber    = 1;
    let prevLexemInt  = false;
    let strIdent      = '';
    let iLabel        = 0;
    let i;
    const lexParser = new LexemParser();
    for (i = 0; i < strSrc.length;) {
      const symSrc = strSrc.charAt(i);
      if (symSrc === '\n') {
        lineNumber++;
      }
      // check for ' ', '\n', '\t'
      if (this.isSpace(symSrc)) {
        i++;
        continue;
      }
      // now we have character or digit
      const iNext = this.getNextDelimiter(strSrc, i);
      const len = iNext - i;
      if (len > MAX_IDENTIFIER_LEN) {
        const strA = `Too long identifier found in ${lineNumber} line.`;
        const strC = `Identifier length should be less then ${MAX_IDENTIFIER_LEN}`;
        this.m_strErr = `${strA} ${strC}`;
        return false;
      }
      const strLexemToParse = strSrc.substring(i, i + len);
      const lexemType = lexParser.getLexemByString(strLexemToParse);
      const curLexemInt = (lexemType === LexemType.LEXEM_CONST_INT) ? true : false;
      // console.log(`lex/Tp/PInt/CInt = ${strLexemToParse} / ${lexemType} / ${prevLexemInt} / ${curLexemInt}`);
      if ((lexemType === LexemType.LEXEM_COLON) && (prevLexemInt)) {
        strIdent = '';
        let j;
        for (j = 0; iLabel + j < strSrc.length; j++) {
          const sym = strSrc.charAt(iLabel + j);
          if (this.isDelimiter(sym)) {
            break;
          }
          strIdent += sym;
        }
        // assert(i < MAX_IDENTIFIER_LEN);

        const strA = `Invalid numerical label found in ${lineNumber} line.`;
        const strB = `Bad label is: ${strIdent}`;
        this.m_strErr = `${strA} ${strB}`;
        return false;
      }

      // next lexem
      iLabel = i;
      i = iNext;
      prevLexemInt = curLexemInt;
    } // for
    return true;
  }

  private getIdentifierIndex(strIdentifier) {
    const strLen = strIdentifier.length;
    const numIdentifiers = this.m_identifiers.length;
    for (let i = 0; i < numIdentifiers; i++) {
      const l = this.m_identifiers[i].length;
      if (l === strLen) {
        if (this.m_identifiers[i] === strIdentifier) {
          return i;
        }
      }
    }
    const BAD_INDEX = -1;
    return BAD_INDEX;
  }

  private addIdentifier(strIdentifier) {
    const ind = this.getIdentifierIndex(strIdentifier);
    if (ind >= 0) {
      return true;
    }
    // add new identifier
    this.m_identifiers.push(strIdentifier);
  }

  /**
   * Replace all symbolic labels to integers
   * @param strSrc - Input string.
   * @return replaced code
   */

  public replaceLabelsToInts(strSrc) {
    let strIdent          = '';
    let lineNumber        = 1;
    const lexParser       = new LexemParser();
    let   prevLexemIdent  = false;
    let prevLexemJump     = false;
    let isPrev            = 0;
    this.m_strErr         = '';

    this.m_identifiers = null;
    this.m_identifiers = new Array();

    // console.log(`replaceLabelsToInts: ${strSrc}`);

    let i;
    for (i = 0; i < strSrc.length;) {
      const symSrc = strSrc.charAt(i);
      if (symSrc === '\n') {
        lineNumber++;
      }
      // check for ' ', '\n', '\t'
      if (this.isSpace(symSrc)) {
        i++;
        continue;
      }
      const iNext = this.getNextDelimiter(strSrc, i);
      let   len = iNext - i;
      const strLexemToParse = strSrc.substring(i, i + len);
      const lexemType = lexParser.getLexemByString(strLexemToParse);
      const curLexemIdent = (lexemType === LexemType.LEXEM_IDENTIFIER) ? true : false;
      const curLexemJump = ((lexemType >= LexemType.LEXEM_OP_JMP) && (lexemType < LexemType.LEXEM_OP_LAST)) ? true : false;

      // console.log(`Preprocessor. strLexemToParse = ${strLexemToParse}`);
      // console.log(`Preprocessor. lexemType = ${lexParser.getStringByLexem(lexemType)}`);

      // skip spaces: ' ', '\n'
      let iNextS = iNext;
      let sym = strSrc.charAt(iNextS);
      while (this.isSpace(sym) && (iNextS < strSrc.length)) {
        iNextS++;
        sym = strSrc.charAt(iNextS);
      }
      const iNextE  = this.getNextDelimiter(strSrc, iNextS);
      len = iNextE - iNextS;
      const strLexemToParseNext = strSrc.substring(iNextS, iNextS + len);
      const lexemTypeNext = lexParser.getLexemByString(strLexemToParseNext);

      // console.log(`Preprocessor. strLexemToParseNext = ${strLexemToParseNext}`);
      // console.log(`Preprocessor. lexemType = ${lexParser.getStringByLexem(lexemTypeNext)}`);

      // check Label :
      if (lexemType === LexemType.LEXEM_COLON) {
        // previous should be Identifier
        if (!prevLexemIdent) {
          if (isPrev === 0) {
            this.m_strErr = `Should be label identifier before ${lineNumber} line`;
          } else {
            strIdent = '';
            let j;
            for (j = 0; j + isPrev < strSrc.length; j++) {
              const symIdn = strSrc.charAt(j + isPrev);
              if (this.isDelimiter(symIdn)) {
                break;
              }
              strIdent += symIdn;
            }
            // assert(i < MAX_IDENTIFIER_LEN);
            const strA = `Invalid label found in line ${lineNumber}`;
            const strB = `Bad label is: ${strIdent}`;
            this.m_strErr = `${strA} ${strB}`;
          }
          return '';
        } // if (prev lexem was not identifier)
        // add identifier
        const isPrevDelim = this.getNextDelimiter(strSrc, isPrev);
        const strLexemIdentifier = strSrc.substring(isPrev, isPrevDelim);

        // console.log(`Added identifier = ${strLexemIdentifier}`);

        this.addIdentifier(strLexemIdentifier);
      } // if cur lexem is colon (:)
      // if separated identifier
      if (curLexemIdent && !prevLexemJump && (lexemTypeNext !== LexemType.LEXEM_COLON)) {
        if (isPrev === 0) {
          this.m_strErr = `Label should be finished with ':' in line ${lineNumber}, code=${strSrc}`;
          // console.log(this.m_strErr);
        } else {
          strIdent = '';
          let j;
          for (j = 0; j < strSrc.length; j++) {
            const symIdn = strSrc.charAt(j);
              if (this.isDelimiter(symIdn)) {
                break;
              }
              strIdent += symIdn;
          }

          // assert(i < MAX_IDENTIFIER_LEN);
          const strA = `Invalid identifier found in line ${lineNumber}`;
          const strB = `Bad identifier is: ${strIdent}`;
          this.m_strErr = `${strA} ${strB}`;
        }
        return '';
      }
      // next lexem
      prevLexemIdent = curLexemIdent;
      prevLexemJump  = curLexemJump;
      isPrev = i;
      i = iNext;
    } // for (i) all chars in source code string

    // check all jump labels is found in collection
    prevLexemIdent = false;
    prevLexemJump = false;
    lineNumber = 1;
    for (i = 0; i < strSrc.length;) {
      const symSrc = strSrc.charAt(i);
      if (symSrc === '\n') {
        lineNumber++;
      }
      // check for ' ', '\n', '\t'
      if (this.isSpace(symSrc)) {
        i++;
        continue;
      }

      // now we have character or digit
      const iNext = this.getNextDelimiter(strSrc, i);
      const len = iNext - i;
      const strLexemToParse = strSrc.substring(i, i + len);
      const lexemType = lexParser.getLexemByString(strLexemToParse);
      const curLexemJump = ((lexemType >= LexemType.LEXEM_OP_JMP) && (lexemType < LexemType.LEXEM_OP_LAST)) ? true : false;

      if ((lexemType === LexemType.LEXEM_IDENTIFIER) && prevLexemJump) {
        // find identifier in identifier list, already collected by labels
        strIdent = '';
        let j;
        for (j = 0; (i + j) < strSrc.length; j++) {
          const symAdd = strSrc.charAt(i + j);
          if (this.isDelimiter(symAdd)) {
            break;
          }
          strIdent += symAdd;
        }
        // assert(i < MAX_IDENTIFIER_LEN);
        const ind = this.getIdentifierIndex(strIdent);
        if (ind < 0) {
          const strA = `Wrong label reference found in line ${lineNumber}`;
          const strB = `Label [${strIdent}] was undefined`;
          this.m_strErr = `${strA} ${strB}`;
          return '';
        }
      }
      // next lexem
      prevLexemJump   = curLexemJump;
      i               = iNext;
    }

    // replace character labels into line numbers
    let strDst = '';
    for (i = 0; i < strSrc.length;) {
      const symSrc = strSrc.charAt(i);
      if (symSrc === '\n') {
        lineNumber++;
      }
      // check for ' ', '\n', '\t'
      if (this.isSpace(symSrc)) {
        strDst += symSrc;
        i++;
        continue;
      }
      // now we have character or digit
      const iNext = this.getNextDelimiter(strSrc, i);
      const len = iNext - i;
      const strLexemToParse = strSrc.substring(i, i + len);
      const lexemType = lexParser.getLexemByString(strLexemToParse);
      if (lexemType === LexemType.LEXEM_IDENTIFIER) {
        // if current lexem is identifier
        // replace output to number
        strIdent = '';
        let j;
        for (j = 0; (i + j) < strSrc.length; j++) {
          const symAdd = strSrc.charAt(i + j);
          if (this.isDelimiter(symAdd)) {
            break;
          }
          strIdent += symAdd;
        }
        const index = this.getIdentifierIndex(strIdent);
        // assert(index > 0);
        const strIndex = `${index}`;
        for (j = 0; j < strIndex.length; j++) {
          strDst += strIndex.charAt(j);
        }
      } else {
        // if current is not identifier
        // simple write to dest
        for (let j = i; j < iNext; j++) {
          strDst += strSrc.charAt(j);
        }
      }
      // next lexem
      i = iNext;
    } // for (i) all src chars
    return strDst;
  } // end of replaceLabelsToInts
}

