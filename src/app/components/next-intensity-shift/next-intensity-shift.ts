import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EnergyDataService } from '../../services/energy-data';
import { getNextLowIndex, getNextNonLowIndex } from '../../utils/data-utils';
import { hoursBetween } from '../../utils/date-utils';
import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { KebabCasePipe } from '../../pipes/kebab-case-pipe';

@Component({
  selector: 'app-next-intensity-shift',
  host: {
    'aria-live': 'polite',
    'aria-atomic': 'true'
  },
  imports: [AsyncPipe, KebabCasePipe],
  templateUrl: './next-intensity-shift.html',
  styleUrl: './next-intensity-shift.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextIntensityShift {
  private energyService = inject(EnergyDataService);

  intensityState$ = this.energyService.get48hData$.pipe(
    map(data => {
      if (data === null) return null;

      const currentIntensity = data.current.intensity;

      const isLow = ['low', 'very low'].includes(currentIntensity.index);

      const nextRelevantPeriod = isLow
        ? getNextNonLowIndex(data.future)
        : getNextLowIndex(data.future);

      const hoursTillNext = nextRelevantPeriod === undefined
        ? undefined  // No next period found
        : hoursBetween(data.current.to, nextRelevantPeriod.to);

      const uiIndexText = isLow
        ? "low or very low"
        : "moderate or higher";

      return { currentIntensity, uiIndexText, hoursTillNext };
    })
  );
}
