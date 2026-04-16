import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'kebabCase',
})

export class KebabCasePipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    return value.replaceAll(' ', '-');
  }
}
