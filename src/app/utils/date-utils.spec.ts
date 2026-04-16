import { dateToHour, getDateFW24h, getDatePT24h, pad } from './date-utils';

describe('getDateFW24h', () => {
  it('should return string representing one day in the future', () => {
    expect(getDateFW24h('2026-04-15T22:00Z')).toBe('2026-04-16T23:00Z');
  });
});

describe('getDatePT24h', () => {
  it('should return string representing one day in the past', () => {
    expect(getDatePT24h('2026-04-15T22:00Z')).toBe('2026-04-14T23:00Z');
  });
});

describe('dateToHour', () => {
  it('should round date down to 00 minutes', () => {
    expect(dateToHour(new Date('2026-04-15T22:45Z'))).toStrictEqual(new Date('2026-04-15T22:00Z'));
  });
});

// prettier-ignore
describe('pad', () => {
  it('0 --> 00', () => { expect(pad(0)).toStrictEqual('00') });
  it('1 --> 01', () => { expect(pad(1)).toStrictEqual('01') });
  it('2 --> 02', () => { expect(pad(2)).toStrictEqual('02') });
  it('9 --> 09', () => { expect(pad(9)).toStrictEqual('09') });
});
