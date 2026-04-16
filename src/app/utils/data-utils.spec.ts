import { RegionalIntensityData } from '../types/intensity-data.type';
import {
  getIntensityRanking,
  getNextNonLowIndex,
  getNextLowIndex,
  getIndexValue,
  getGraphSeries,
  splitCurrentPastFuture,
} from './data-utils';

describe('getIndexValue', () => {
  it('should return 1 for "very low"', () => {
    expect(getIndexValue('very low')).toBe(1);
  });
  it('should return 2 for "low"', () => {
    expect(getIndexValue('low')).toBe(2);
  });
  it('should return 3 for "moderate"', () => {
    expect(getIndexValue('moderate')).toBe(3);
  });
  it('should return 4 for "high"', () => {
    expect(getIndexValue('high')).toBe(4);
  });
  it('should return 5 for "very high"', () => {
    expect(getIndexValue('very high')).toBe(5);
  });
  it('should return 4 for "HIGH"', () => {
    expect(getIndexValue('HIGH')).toBe(4);
  });
});

describe('getIntensityRanking', () => {
  it('should return "very low" for values at or below 24', () => {
    expect(getIntensityRanking(24)).toBe('very low');
  });
  it('should return "low" for 89', () => {
    expect(getIntensityRanking(89)).toBe('low');
  });
  it('should return "moderate" for 169', () => {
    expect(getIntensityRanking(169)).toBe('moderate');
  });
  it('should return "high" for 230', () => {
    expect(getIntensityRanking(230)).toBe('high');
  });
  it('should return "very high" for 231', () => {
    expect(getIntensityRanking(231)).toBe('very high');
  });
});

describe('getNextNonLowIndex', () => {
  const veryLow = {
    from: '2025-06-18T13:30Z',
    to: '2025-06-18T14:00Z',
    intensity: { forecast: 20, actual: 19, index: 'very low' },
  };
  const low = {
    from: '2025-06-18T14:30Z',
    to: '2025-06-18T15:00Z',
    intensity: { forecast: 96, actual: 99, index: 'low' },
  };
  const moderate = {
    from: '2025-06-18T15:00Z',
    to: '2025-06-18T15:30Z',
    intensity: { forecast: 100, actual: 117, index: 'moderate' },
  };
  const high = {
    from: '2026-01-18T12:30Z',
    to: '2026-01-18T13:00Z',
    intensity: { forecast: 207, actual: 200, index: 'high' },
  };

  it('should return the first non-low item, excluding the first array item', () => {
    expect(getNextNonLowIndex([low, veryLow, high, moderate])).toBe(high);
  });
  it('should return the first non-low item, excluding the first array item', () => {
    expect(getNextNonLowIndex([moderate, high])).toBe(high);
  });
  it('should return undefined if all items are low or very low', () => {
    expect(getNextNonLowIndex([low, veryLow, veryLow])).toBe(undefined);
  });
});

describe('getNextLowIndex', () => {
  const veryLow = {
    from: '2025-06-18T13:30Z',
    to: '2025-06-18T14:00Z',
    intensity: { forecast: 20, actual: 19, index: 'very low' },
  };
  const low = {
    from: '2025-06-18T14:30Z',
    to: '2025-06-18T15:00Z',
    intensity: { forecast: 96, actual: 99, index: 'low' },
  };
  const moderate = {
    from: '2025-06-18T15:00Z',
    to: '2025-06-18T15:30Z',
    intensity: { forecast: 100, actual: 117, index: 'moderate' },
  };
  const high = {
    from: '2026-01-18T12:30Z',
    to: '2026-01-18T13:00Z',
    intensity: { forecast: 207, actual: 200, index: 'high' },
  };

  it('should return the first low/very low item, excluding the current period', () => {
    expect(getNextLowIndex([low, veryLow, low])).toBe(veryLow);
  });
  it('should return the first low/very low item, excluding the current period', () => {
    expect(getNextLowIndex([moderate, high, low, veryLow])).toBe(low);
  });
  it('should return undefined if no items are low or very low', () => {
    expect(getNextLowIndex([high, moderate, moderate])).toBe(undefined);
  });
});

describe('getGraphSeries', () => {
  const withActualValues = [
    {
      from: '2025-06-18T14:00Z',
      to: '2025-06-18T14:30Z',
      intensity: { forecast: 95, actual: 91, index: 'low' },
    },
    {
      from: '2025-06-18T14:30Z',
      to: '2025-06-18T15:00Z',
      intensity: { forecast: 96, actual: 99, index: 'low' },
    },
  ];
  const withActualValuesResult = [
    ['2025-06-18T14:30Z', 91],
    ['2025-06-18T15:00Z', 99],
  ];

  const nullActualValues = [
    {
      from: '2025-06-18T14:00Z',
      to: '2025-06-18T14:30Z',
      intensity: { forecast: 95, actual: 91, index: 'low' },
    },
    {
      from: '2025-06-18T14:30Z',
      to: '2025-06-18T15:00Z',
      intensity: { forecast: 96, actual: null, index: 'low' },
    },
  ];
  const nullActualValuesResult = [
    ['2025-06-18T14:30Z', 91],
    ['2025-06-18T15:00Z', 96],
  ];
  const onlyForecastValues: RegionalIntensityData[] = [
    {
      from: '2025-06-18T14:00Z',
      to: '2025-06-18T14:30Z',
      intensity: { forecast: 95, index: 'low' },
      generationMix: [{ fuel: 'biomass', perc: 22.2 }],
    },
    {
      from: '2025-06-18T14:30Z',
      to: '2025-06-18T15:00Z',
      intensity: { forecast: 96, index: 'low' },
      generationMix: [{ fuel: 'biomass', perc: 22.2 }],
    },
  ];
  const onlyForecastValuesResult = [
    ['2025-06-18T14:30Z', 95],
    ['2025-06-18T15:00Z', 96],
  ];

  it('should use actual values over forecast values', () => {
    expect(getGraphSeries(withActualValues)).toStrictEqual(withActualValuesResult);
  });

  it('should use forecast values when actual is null', () => {
    expect(getGraphSeries(nullActualValues)).toStrictEqual(nullActualValuesResult);
  });

  it('should use forecast values when the actual propert does not exist', () => {
    expect(getGraphSeries(onlyForecastValues)).toStrictEqual(onlyForecastValuesResult);
  });
});
describe('splitCurrentPastFuture', () => {
  const past = [
    {
      from: '2025-06-18T13:30Z',
      to: '2025-06-18T14:00Z',
      intensity: { forecast: 95, actual: 91, index: 'low' },
    },
    {
      from: '2025-06-18T14:00Z',
      to: '2025-06-18T14:30Z',
      intensity: { forecast: 95, actual: 91, index: 'low' },
    },
  ];
  const future = [
    {
      from: '2025-06-18T15:00Z',
      to: '2025-06-18T15:30Z',
      intensity: { forecast: 96, actual: 99, index: 'low' },
    },
    {
      from: '2025-06-18T15:30Z',
      to: '2025-06-18T16:00Z',
      intensity: { forecast: 96, actual: 99, index: 'low' },
    },
  ];
  const current = {
    from: '2025-06-18T14:30Z',
    to: '2025-06-18T15:00Z',
    intensity: { forecast: 95, actual: 91, index: 'low' },
  };

  const now = '2025-06-18T15:00Z';

  it('Should split into past, future, and current', () => {
    expect(splitCurrentPastFuture([...past, current, ...future], now)).toStrictEqual({
      current: current,
      past: past,
      future: [current, ...future],
    });
  });
});
