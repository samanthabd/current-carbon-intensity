import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent, MarkLineComponent, VisualMapComponent  } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import type { EChartsCoreOption } from 'echarts/core';
import { CommonModule } from '@angular/common';

echarts.use([LineChart, GridComponent, TooltipComponent, SVGRenderer, TitleComponent, TooltipComponent, LegendComponent, MarkLineComponent, VisualMapComponent]);

@Component({
  selector: 'app-line-chart',
  imports: [NgxEchartsDirective, CommonModule],
  providers: [provideEchartsCore({ echarts })],
  template: `
    <div echarts [options]="options()" style="height: 300px"></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent {
  readonly options = input.required<EChartsCoreOption>();
}
