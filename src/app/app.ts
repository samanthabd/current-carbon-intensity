import { Component, signal } from '@angular/core';
import { CurrentIntensity } from './components/current-intensity/current-intensity';
import { RegionSelect } from './components/region-select/region-select';

@Component({
  selector: 'app-root',
  imports: [RegionSelect, CurrentIntensity],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('current-carbon-intensity');
}
