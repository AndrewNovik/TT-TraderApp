import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fixNums',
})
export class FixNumsPipe implements PipeTransform {
  transform(value: number): string {
    return Number(value.toFixed(3)).toLocaleString('en', {
      maximumFractionDigits: 3,
      minimumFractionDigits: 0,
    });
  }
}
