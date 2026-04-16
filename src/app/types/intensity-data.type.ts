export type NationalIntensityData = {
  to: string,
  from: string,
  intensity: {
    actual: number | null,
    forecast: number,
    index: string
  }
}

export type RegionalIntensityData = {
  to: string,
  from: string,
  intensity: {
    forecast: number,
    index: string
  },
  generationMix: { fuel: string; perc: number }[];
}

export type IntensityData = RegionalIntensityData | NationalIntensityData;
