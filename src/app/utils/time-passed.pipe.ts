import { Pipe, PipeTransform } from '@angular/core';

interface ITime {
  d: number;
  h: number;
  m: number;
  s: number;
  months: number;
  years: number;
}

@Pipe({
  name: 'timePassed'
})
export class TimePassedPipe implements PipeTransform {

  transform(start: Date, end?: Date): string {
    const endTS:number = end ? +end : Date.now(); 
    const diffTime:ITime = this.diffTime(+start,endTS);
    
    let   s: string, n: number;

    if (diffTime.years) {
      n = diffTime.years;
      s = this.plural(n, 'year', 'years', 'years');
    } else if (diffTime.months) {
      n = diffTime.months;
      s = this.plural(n, 'month', 'months', 'months');
    } else if (diffTime.d) {
      n = diffTime.d;
      s = this.plural(n, 'day', 'days', 'days');     
    } else if (diffTime.h) {
      n = diffTime.h;
      s = this.plural(n, 'hour', 'hours', 'hours');     
    } else {
      n = diffTime.m;
      s = this.plural(n, 'minute', 'minutes', 'minutes');     
    }

    return `${n} ${s} ago`;
  }

  diffTime(date1: number, date2: number): ITime {
    let 	sec:number = ~~((date2 - date1)/1000),
					min:number = ~~(sec/60),
					hour:number = ~~(min/60),
          days:number = ~~(hour/24);
    
    hour = hour - 24 * days;
    min = min - 60 * (hour + 24 * days);
    sec = sec - 60 * (min + 60 * (hour + 24 * days));
    
    return {
      years: ~~(days / 365),
      months: ~~(days / 30),
      d: days,
      h: hour,
      m: min,
      s: sec
    };          
  }

  plural(a: number, form1: string, form2: string, form3: string): string {
    if ( a % 10 == 1 && a % 100 != 11 ) return form1;
    else if ( a % 10 >= 2 && a % 10 <= 4 && ( a % 100 < 10 || a % 100 >= 20)) return form2;
    else return form3;
  }
}

