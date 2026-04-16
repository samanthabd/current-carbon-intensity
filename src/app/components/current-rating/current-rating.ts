import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { KebabCasePipe } from '../../pipes/kebab-case-pipe';
import { EnergyDataService } from '../../services/energy-data';
import { map } from 'rxjs';

@Component({
  selector: 'app-current-rating',
  host: {
    'aria-live': 'polite',
    'aria-atomic': 'true'
  },
  imports: [TitleCasePipe, AsyncPipe, KebabCasePipe],
  templateUrl: './current-rating.html',
  styleUrl: './current-rating.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentRating {
  private energyService = inject(EnergyDataService);

  currentIntensity$ = this.energyService.get48hData$.pipe(
    map(data => {
      if (data === null) return null;

      const index = data.current.intensity.index;
      const value = 'actual' in data.current.intensity
        ? data.current.intensity.actual ?? data.current.intensity.forecast
        : data.current.intensity.forecast;

      return { index, value };
    })
  );
}
