import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { getNow, getDatePT24h, getDateFW24h, msUntilNextHalfHour } from '../utils/date-utils';
import { splitCurrentPastFuture } from '../utils/data-utils';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  timer,
} from 'rxjs';
import { ApiResponse, NationalApiResponse, RegionalApiResponse } from '../types/api-response.type';

@Injectable({
  providedIn: 'root',
})

export class EnergyDataService {
  private http = inject(HttpClient);
  // private readonly poll$ = timer(0, 30_000);
  private readonly alignedPoll$ = merge(
    of(0), // immediately get data
    timer(msUntilNextHalfHour(), 30 * 60 * 1000)
  );
  private readonly baseUrl = 'https://api.carbonintensity.org.uk';

  /* null = national data; a string = regional ID */
  private readonly _regionId$ = new BehaviorSubject<string | null>(null);
  readonly regionId$ = this._regionId$.asObservable();

  setRegion(id: string | null) {
    this._regionId$.next(id);
  }

  get48hData$ = combineLatest([
    this.alignedPoll$,
    this._regionId$
  ]).pipe(
    switchMap(([, regionId]) => {
      const now = getNow();
      const endpointBase = `intensity/${getDatePT24h(now)}/${getDateFW24h(now)}`;

      const url = regionId
        ? `${this.baseUrl}/regional/${endpointBase}/regionid/${regionId}`
        : `${this.baseUrl}/${endpointBase}`;

      return this.http.get<ApiResponse>(`${url}`).pipe(
        catchError(() => of(null)),
        map(response => ({ response, regionId, now }))
      );
    }),
    map(({ response, regionId, now }) => {
      if (!response) return null;

      const data = regionId
        ? (response as RegionalApiResponse).data.data
        : (response as NationalApiResponse).data;

      return splitCurrentPastFuture(data, now);
    }),
    shareReplay(1)
  );
}
