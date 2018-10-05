
const BIT_CARRY = 0;
const BIT_PARITY = 2;
const BIT_ADJUST = 4;
const BIT_ZERO = 6;
const BIT_SIGN = 7;
const BIT_DIRECTION = 10;
const BIT_OVERFLOW = 11;

export enum RegFlags {
  /* tslint:disable-next-line */
  FLAG_CARRY      = (1 << BIT_CARRY),
  /* tslint:disable-next-line */
  FLAG_PARITY     = (1 << BIT_PARITY),
  /* tslint:disable-next-line */
  FLAG_ADJUST     = (1 << BIT_ADJUST),
  /* tslint:disable-next-line */
  FLAG_ZERO       = (1 << BIT_ZERO),
  /* tslint:disable-next-line */
  FLAG_SIGN       = (1 << BIT_SIGN),
  /* tslint:disable-next-line */
  FLAG_DIRECTION  = (1 << BIT_DIRECTION),
  /* tslint:disable-next-line */
  FLAG_OVERFLOW   = (1 << BIT_OVERFLOW),
}
