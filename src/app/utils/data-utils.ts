import { IntensityData } from '../types/intensity-data.type';

const indexValues: Record<string, number> = {
  'very low': 1,
  'low': 2,
  'moderate': 3,
  'high': 4,
  'very high': 5
};

export function getIndexValue(indexValue: string) {
  return indexValues[indexValue.toLowerCase()];
}

export function getNextNonLowIndex(fwData: IntensityData[]): IntensityData | undefined {
  const lowValue = getIndexValue('low');
  /* Slice becasuse first value is always current period */
  return fwData.slice(1).find(data => {
    const comparisonValue = getIndexValue(data.intensity.index);
    return lowValue < comparisonValue;
  });
}

export function getNextLowIndex(fwData: IntensityData[]): IntensityData | undefined {
  const lowValue = getIndexValue('low');
  /* Slice becasuse first value is always current period */
  return fwData.slice(1).find(data => {
    const comparisonValue = getIndexValue(data.intensity.index);
    return lowValue >= comparisonValue;
  });
}

export function getGraphSeries(data: IntensityData[]) {
  const intensity: [string, number][] = [];
  data.forEach((item: IntensityData) => {
    /* Only national intensity will have 'actual' values, and only for past
     * data. Use that when available, otherwise use forecast, which is always
     * available.   */
    intensity.push([item.to, 'actual' in item.intensity
      ? item.intensity.actual ?? item.intensity.forecast
      : item.intensity.forecast
    ]);
  });
  return intensity;
}

export function getIntensityRanking(value: number): string {
  switch (true) {
    case value <= 24:
      return 'very low';
    case value <= 89:
      return 'low';
    case value <= 169:
      return 'moderate';
    case value <= 230:
      return 'high';
    case value > 230:
      return 'very high';
  }
  throw new Error(`Unexpected value: ${value}`);
}

export function splitCurrentPastFuture(data: IntensityData[], now: string) {
  const i = data.findIndex(item => item.to == now)
  const past = data.slice(0, i);
  /*   Future will also include current, to help join the serie */
  const future = data.slice(i);
  const current = data[i];
  return { current, past, future };
}
