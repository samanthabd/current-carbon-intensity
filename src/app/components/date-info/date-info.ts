import { Component, computed, input } from '@angular/core';
import { getDateString } from '../../utils/date-utils';
import { IntensityData } from '../../types/intensity-data.type';
@Component({
  selector: 'app-date-info',
  imports: [],
  templateUrl: './date-info.html',
  styleUrl: './date-info.scss',
})
export class DateInfo {
  currentIntensity = input.required<IntensityData>();

  toDate = computed(() => getDateString(this.currentIntensity().to))
  fromDate = computed(() => getDateString(this.currentIntensity().from))
}

