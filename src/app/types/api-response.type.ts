import { NationalIntensityData, RegionalIntensityData } from './intensity-data.type';


export type NationalApiResponse = {
  data: NationalIntensityData[];
};

export type RegionalApiResponse = {
  data: {
    regionid: number;
    shortname: string;
    dnoregion: string;
    data: RegionalIntensityData[];
  };
};

export type ApiResponse = RegionalApiResponse | NationalApiResponse;
