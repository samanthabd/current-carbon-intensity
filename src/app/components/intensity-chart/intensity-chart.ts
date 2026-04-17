import { Component, inject, signal } from '@angular/core';
import { EnergyDataService } from '../../services/energy-data';
import { getGraphSeries, getIntensityRanking } from '../../utils/data-utils';
import type { EChartsCoreOption } from 'echarts/core';
import { LineChartComponent } from '../charts/line-chart/line-chart';
import type { CallbackDataParams } from 'echarts/types/dist/shared';
import * as echarts from 'echarts/core';
import { combineLatest, map, merge, skip, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { COLORS } from '../../constants/colors.constants';
import { escapeHtml, toSentenceCase } from '../../utils/general-utils';

@Component({
  selector: 'app-intensity-chart',
  imports: [AsyncPipe, LineChartComponent],
  templateUrl: './intensity-chart.html',
  styleUrl: './intensity-chart.scss',
})
export class IntensityChart {
  private energyService = inject(EnergyDataService);
  visualMapPieceCount = signal(0);

  graphSeries$ = this.energyService.get48hData$.pipe(
    map((data) => {
      if (data === null) return null;

      const past24hSeries = getGraphSeries(data.past);
      const next24hSeries = getGraphSeries(data.future);
      const current = data.current;
      return { current, series: [past24hSeries, next24hSeries] };
    })
  )

  /* *
   * Filter visual map segments, so that only those actually represented
   * in the series data are shown in the legend
   */
  private getVisualMapConfigs$ = this.graphSeries$.pipe(map(graphData => {
    if (!graphData) return [];

    const pieces = [
      {
        gt: 0,
        lte: 24,
        color: COLORS.veryLow,
        label: 'Very low '
      },
      {
        gt: 24,
        lte: 89,
        color: COLORS.low,
        label: 'Low'
      },
      {
        gt: 89,
        lte: 169,
        color: COLORS.moderate,
        label: 'Moderate'
      },
      {
        gt: 169,
        lte: 230,
        color: COLORS.high,
        label: 'High'
      },
      {
        gt: 230,
        color: COLORS.veryHigh,
        label: 'Very high'
      },
    ];

    const data = graphData.series.flat();
    const relevantPieces = pieces.filter(rating => {
      const thresholdHigh = rating.gt;
      const thresholdLow = rating.lte || false;
      return data.some(d => (
        thresholdLow
          ? ((d[1] <= thresholdLow) && (d[1] >= thresholdHigh))
          : (d[1] > thresholdHigh)
      ));
    });
    return relevantPieces;
  }));

  options$ = combineLatest([
    this.graphSeries$,
    this.getVisualMapConfigs$
  ]).pipe(map(([graphData, visualMapConfigs]) => {
    if (graphData === null) return null;

    const options = {
      grid: {
        top: 0,
        left: 0,
        right: 0
      },
      textStyle: {
        fontFamily: 'Mulish',
        fontSize: 13,
        fontWeight: 500
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        // position: [10, 10],
        className: 'intensity-chart-tooltip',
        formatter: (params: [CallbackDataParams]) => {
          const { value } = params[0];
          const date = (value as [string, number])[0];
          const s = echarts.time.format(date, '{dd} {MMMM} {HH}:{mm}', false)
          const val = (value as [string, number])[1];
          return (
            '<span class="tool-tip__date">' + escapeHtml(s) + '</span>' +
            '<div class="tool-tip__data">' +
            params[0].marker +
            '<span class="tool-tip__ranking">' +
            escapeHtml(toSentenceCase(getIntensityRanking(val))) +
            '</span>' +
            '<span class="tool-tip__value">' +
            escapeHtml(`${val}`) +
            '</span>' +
            '</div>'
          );
        },
      },
      xAxis: {
        type: 'time',
        maxInterval: 3600 * 1000 * 3.5,
        axisLine: {
          lineStyle: { color: 'var(--ui)' }
        },
        axisLabel: {
          margin: 9,
          hideOverlap: true,
          formatter: {
            hour: '{HH}:{mm}',
            minute: '{pad|{HH}:{mm}}',
            day: '{HH}:{mm}\n\n{MMM} {d}',
          },
        },
        axisTick: { interval: 0 }

      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'var(--text-lightest)' }
      },
      visualMap: {
        id: 'vm',
        bottom: 0,
        left: 'center',
        orient: 'horizontal',
        itemGap: 15,
        textGap: 5,
        pieces: visualMapConfigs,
        outOfRange: { color: '#999' }
      },
      series: [
        {
          type: 'line',
          name: 'Intensity',
          data: graphData.series[0],
          showSymbol: false,
          markLine: {
            animation: false,
            symbol: 'none',
            data: [{
              name: "Now",
              xAxis: graphData.current.from,
              lineStyle: {
                color: '#b5b5b5',
                type: 'dashed',
              },
              emphasis: { disabled: true },
              label: {
                show: false,
                // formatter: "Now"
              },
            }]
          },
        },
        {
          type: 'line',
          lineStyle: {
            type: [4, 2],
            join: 'round'
          },
          // overlap to join series lines
          data: [
            graphData.series[0][graphData.series[0].length - 1],
            ...graphData.series[1]
          ],
          showSymbol: false
        }],
      media: [{
        query: { maxWidth: 400 },
        option: {
          xAxis: {
            axisLabel: { color: 'var(--text-lightest)' }
          },
          yAxis: {
            axisLabel: { color: 'var(--text-lightest)' }
          },
          /* If we are showing all 5 labels on a small screen,
           * tweak the icons so the text is not cut off  */
          visualMap: visualMapConfigs.length >= 5 ?
            [{
              bottom: -10,
              left: 'center',
              orient: 'horizontal',
              itemWidth: 10,
              itemGap: 12,
              textGap: 3,
              pieces: visualMapConfigs,
              outOfRange: { color: '#999' }
            }] : [],
        }
      }]
    } as EChartsCoreOption
    return options;
  }));

  loading$ = merge(
    this.energyService.regionId$.pipe(skip(1), map(() => true)),
    this.options$.pipe(map(() => false))
  ).pipe(startWith(false));
}
