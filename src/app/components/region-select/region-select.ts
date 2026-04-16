import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { EnergyDataService } from '../../services/energy-data';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
interface Region {
  id: number | string;
  name: string;
  flatIndex: number;
}
interface RegionGroup {
  country: string | null;
  regions: Region[];
}
@Component({
  selector: 'app-region-select',
  imports: [],
  templateUrl: './region-select.html',
  styleUrl: './region-select.scss',
})
export class RegionSelect {
  private readonly energyService = inject(EnergyDataService); // for setting new region
  private readonly comboBox = viewChild.required<ElementRef>('comboBox');
  private readonly listbox = viewChild.required<ElementRef>('listbox');
  isOpen = signal(false);

  readonly regionGroups: RegionGroup[] = (() => {
    let i = 0;
    return [
      {
        country: null,
        regions: [ { id: 'national', name: 'Great Britain', flatIndex: i++} ]
      },
      {
        country: 'England',
        regions: [
          { id: 3,  name: 'North West England', flatIndex: i++ },
          { id: 4,  name: 'North East England', flatIndex: i++ },
          { id: 5,  name: 'Yorkshire', flatIndex: i++ },
          { id: 8,  name: 'West Midlands', flatIndex: i++ },
          { id: 9,  name: 'East Midlands', flatIndex: i++ },
          { id: 10, name: 'East England', flatIndex: i++ },
          { id: 11, name: 'South West England', flatIndex: i++ },
          { id: 12, name: 'South England', flatIndex: i++ },
          { id: 13, name: 'London', flatIndex: i++ },
          { id: 14, name: 'South East England', flatIndex: i++ },
          { id: 15, name: 'England', flatIndex: i++ }
        ]
      },
      {
        country: 'Scotland',
        regions: [
          { id: 1,  name: 'North Scotland', flatIndex: i++ },
          { id: 2,  name: 'South Scotland', flatIndex: i++ },
          { id: 16, name: 'Scotland', flatIndex: i++ }
        ]
      },
      {
        country: 'Wales',
        regions: [
          { id: 6,  name: 'North Wales & Merseyside', flatIndex: i++ },
          { id: 7,  name: 'South Wales', flatIndex: i++ },
          { id: 17, name: 'Wales', flatIndex: i++ }
        ]
      }
    ];
  })();

  private readonly maxIndex = this.regionGroups.flatMap(g => g.regions).length - 1;
  /* The national region is the default */
  selectedRegion = signal<Region>(this.regionGroups[0].regions[0]);
  activeRegionIndex = signal<number>(0);
  /* The selected region = the current region
   * The active region = the visually 'focused' item (not true focus, visual
   * only). Will be made selected region when drop down is closed (except with
   * esc keypress)
   * */

   constructor() {
    fromEvent(document, 'mousedown')
      .pipe(takeUntilDestroyed())
      .subscribe(event => this.handleClick(event));
  }

  private handleClick = (event: Event) => {
    /* If the click is in the list or on the combobox, we can ignore it */
    if (
      this.listbox().nativeElement.contains(event.target) ||
      this.comboBox().nativeElement.contains(event.target)
    ) {
      return;
    } else {
      this.updateRegion();
      this.close();
    }
  };

  onRegionControlKeyPress(event: KeyboardEvent) {
    if (event.key != 'Tab') {
      event.preventDefault();
    }

    /* Handle events when closed */
    const openKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' '];
    if (!this.isOpen()) {
      if (openKeys.includes(event.key)) {
        this.open();
      } else if (event.key == 'End') {
        this.activeRegionIndex.set(this.maxIndex);
        this.open();
      } else if (event.key == 'Home') {
        this.activeRegionIndex.set(0);
        this.open();
      }

      /* Handle events when open */
    } else if (this.isOpen()) {
      if (event.key == 'ArrowDown') {
        this.activeRegionIndex.update((value) => value == this.maxIndex ? this.maxIndex : value + 1);
        this.maintainScrollVisibility();
      } else if (event.key == 'ArrowUp') {
        this.activeRegionIndex.update((value) => value == 0 ? 0 : value - 1);
        this.maintainScrollVisibility();
      } else if (event.key == 'Home') {
        this.activeRegionIndex.set(0);
        this.maintainScrollVisibility();
      } else if (event.key == 'End') {
        this.activeRegionIndex.set(this.maxIndex);
        this.maintainScrollVisibility();
      } else if (['Tab', 'Enter', ' '].includes(event.key)) {
        this.close();
        this.updateRegion();
      } else if (event.key == 'Escape') {
        this.close();
      }
    }
  }

  private maintainScrollVisibility() {
    const activeElement = this.listbox().nativeElement.querySelector(
      `[data-option-num="${this.activeRegionIndex()}"]`
    );
    const scrollParent = this.listbox().nativeElement;
    const { offsetHeight, offsetTop } = activeElement;
    const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent;

    /* Get the padding for cleaner offset
     * Note: 'Perfect' alignment relies on padding being a px format, but
     * a 'wrong' type value, or no styling at all doesn't break anything. */
    const parentPadding = +(window.getComputedStyle(scrollParent)
                          .paddingBlockStart.replaceAll(/[^0-9]/g, ''));

    const isAbove = offsetTop < scrollTop;
    const isBelow = offsetTop + offsetHeight > scrollTop + parentOffsetHeight;

    if (isAbove) {
      scrollParent.scrollTo(0, offsetTop - parentPadding);
    } else if (isBelow) {
      scrollParent.scrollTo(0, offsetTop - parentOffsetHeight + offsetHeight + parentPadding);
    }
  }

  toggleDropdown() {
    if (this.isOpen()) {
      this.updateRegion();
      this.close();
    } else {
      this.open();
    }
  }

  private close() {
    this.isOpen.set(false);
  }

  private open() {
    this.isOpen.set(true);
    setTimeout(() => this.maintainScrollVisibility());
  }

  optionClicked(region: Region) {
    this.updateRegion(region);
    this.activeRegionIndex.set(region.flatIndex);
    this.close();
    /* Prevent combobox from losing focus when child clicked */
    setTimeout(() => this.comboBox().nativeElement.focus());
  }

  private updateRegion(region: Region | undefined = undefined) {
    /* *
     * For keyboard events, whatever the newly active region is will already
     * have been visually selected, and will be accessible in
     * this.selectedRegion().
     * However, click events simultaneously set the active region and the
     * selected region, so we need to be able to pass the region from the click
     * event
     * */
    if (!region) {
      region = this.getRegionByIndex(this.activeRegionIndex());
    }
    if (region) {
      /* If selection unchanged, do nothing */
      if (this.selectedRegion().id == region.id) return;

      this.selectedRegion.set(region);
      const id = region.id == 'national' ? null : `${region.id}`;
      this.energyService.setRegion(id);
    }
  }

  private getRegionByIndex(index: number) {
    return this.regionGroups
    .flatMap(g => g.regions)
    .find(r => r.flatIndex === index);
  }
}
