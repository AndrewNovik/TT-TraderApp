import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertNums',
})
export class ConvertNumsPipe implements PipeTransform {
  transform(value: number): string {
    const absNum = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absNum >= 1e9)
      return sign + (absNum / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (absNum >= 1e6)
      return sign + (absNum / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (absNum >= 1e3)
      return sign + (absNum / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return sign + absNum.toString();
  }
}
