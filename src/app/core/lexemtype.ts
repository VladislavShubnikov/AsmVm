
export enum LexemType {

  LEXEM_NA                = 0,
  LEXEM_SEMICOLON         = 1,            // ;
  LEXEM_COLON             = 2,            // :
  LEXEM_COMMA             = 3,            // ,
  LEXEM_DOT               = 4,            // .
  LEXEM_BRACKET_OPEN      = 5,            // [
  LEXEM_BRACKET_CLOSE     = 6,            // ]
  LEXEM_PLUS              = 7,
  LEXEM_MINUS             = 8,
  LEXEM_MUL               = 9,
  LEXEM_DIV               = 10,

  LEXEM_IDENTIFIER        = 20,
  LEXEM_CONST_INT         = 21,
  LEXEM_CONST_FLOAT       = 22,

  LEXEM_BYTE              = 50,
  LEXEM_WORD              = 51,
  LEXEM_DWORD             = 52,
  LEXEM_PTR               = 55,

  LEXEM_OP_NOP            = 100,
  LEXEM_OP_XOR            = 101,
  LEXEM_OP_AND            = 102,
  LEXEM_OP_OR             = 103,
  LEXEM_OP_NOT            = 104,
  LEXEM_OP_NEG            = 105,
  LEXEM_OP_MOV            = 106,
  LEXEM_OP_ADD            = 107,
  LEXEM_OP_SUB            = 108,
  LEXEM_OP_MUL            = 109,
  LEXEM_OP_DIV            = 110,
  LEXEM_OP_SHL            = 111,
  LEXEM_OP_SHR            = 112,
  LEXEM_OP_SAL            = 113,
  LEXEM_OP_SAR            = 114,



  LEXEM_OP_INC            = 120,
  LEXEM_OP_DEC            = 121,
  LEXEM_OP_CMP            = 122,

  LEXEM_OP_PUSH           = 200,
  LEXEM_OP_POP            = 201,

  LEXEM_OP_JMP            = 300,
  LEXEM_OP_JNZ            = 301,
  LEXEM_OP_JZ             = 302,

  LEXEM_OP_JS             = 303,
  LEXEM_OP_JNS            = 304,
  LEXEM_OP_JC             = 305,
  LEXEM_OP_JNC            = 306,

  LEXEM_OP_JNE            = 307,
  LEXEM_OP_JE             = 308,
  LEXEM_OP_JGE            = 309,
  LEXEM_OP_JNGE           = 310,
  LEXEM_OP_JG             = 311,
  LEXEM_OP_JNG            = 312,
  LEXEM_OP_JBE            = 313,
  LEXEM_OP_JNBE           = 314,
  LEXEM_OP_JB             = 315,
  LEXEM_OP_JNB            = 316,
  LEXEM_OP_JLE            = 317,
  LEXEM_OP_JNLE           = 318,
  LEXEM_OP_JL             = 319,
  LEXEM_OP_JNL            = 320,
  LEXEM_OP_JA             = 321,
  LEXEM_OP_JNA            = 322,
  LEXEM_OP_JAE            = 323,
  LEXEM_OP_JNAE           = 324,

  LEXEM_OP_LAST           = 325,


  LEXEM_REG_EAX           = 400,
  LEXEM_REG_EBX           = 401,
  LEXEM_REG_ECX           = 402,
  LEXEM_REG_CL            = 403,
  LEXEM_REG_EDX           = 404,
  LEXEM_REG_EBP           = 405,
  LEXEM_REG_ESP           = 406,
  LEXEM_REG_ESI           = 407,
  LEXEM_REG_EDI           = 408,
  LEXEM_REG_EIP           = 409,
}
