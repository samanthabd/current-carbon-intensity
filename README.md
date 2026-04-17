# Current Carbon Intensity

## Stack
Angular
Apache Echarts
Carbon Intensity API

## Overview
Displays the current carbon intensity, and some forecast information to help plan energy consumption. If levels are low, it tells you how long they are forecasted to remain there. If they are moderate or higher, it tells you how long until they drop. 

Also shows a chart of carbon intensity levels over a 48-window (last and next 24 hours.)

## Features
Custom drop-down menu, based on the WCAG pattern.
Aria live regions to surface region change to screen readers.

Data is "live" and will update automatically, but the endpoint is only updated every 30 minutes.

## Why
Wanted a little demo project to brush up on Angular and check out the newer features.
Also wanted to experiment with implementing a custom dropdrown, following the WCAG pattern. It was fun translating that into Angular.

## Challenges
Rolling your own dropdown really makes you appreciate how much the browser gives you for free.
Initially used 3 separate api calls to grab current intensity, past 24 hour data, and future 24 hour forecast. This resulted in some janky loading when switching regions, adjusting to use a single API call improved this.

## Known Issues
- Aria-live regions sometimes results in reading out the content twice, and in the incorrect order.
- There is also no handling for values when they are the same as the previously selected region (only changed values announced). 
- Chart itself is not a great screenreader experience. Originally had it `aria-hidden`, but hiding visual elements is really not ideal. After some testing decided that was a worse option and removed the property.

## Things I'd do next
- Improve the screen reader experience. I would probably implement a dedicated screen-reader only/visually hidden live region for reading out the page content.
- Better fallbacks and handling of error states in the UI
- Add some additional visualisations, for example generation mix.
- Extract the chart configuration into a small builder 

## Acknowledgements
Drop down based on WCAG pattern:
https://www.w3.org/WAI/ARIA/apg/patterns/listbox/

Data courtesy of Carbon Intensity API from National Energy System Operator (NESO)
[https://carbonintensity.org.uk](https://carbonintensity.org.uk/)
