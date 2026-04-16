import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EnergyDataService } from '../../services/energy-data';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NextIntensityShift } from '../next-intensity-shift/next-intensity-shift';
import { CurrentRating } from '../current-rating/current-rating';

import { IntensityChart } from '../intensity-chart/intensity-chart';

@Component({
  selector: 'app-current-intensity',
  imports: [CommonModule, NextIntensityShift, CurrentRating, IntensityChart],
  templateUrl: './current-intensity.html',
  styleUrl: './current-intensity.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentIntensity {
  private energyService = inject(EnergyDataService);

  hasError$ = this.energyService.get48hData$.pipe(
    map(data => data === null)
  );

}
