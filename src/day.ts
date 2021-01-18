import { Period, TimePickerCardConfig } from './types';
import { Hour } from './models/hour';
import { Minute } from './models/minute';
import { Second } from './models/second';
import { Time } from './models/time';

export class Day {
  public time_on!: Time;
  public time_off!: Time;
  public period_on!: Period;
  public period_off!: Period;
  public day_of_week!: string;

  constructor(
    day_of_week: string,
    hour_on: number,
    hour_off: number,
    config: TimePickerCardConfig,
    minute_on = 0,
    minute_off = 0,
    second_on = 0,
    second_off = 0
  ) {
    this.time_on = new Time(
      new Hour(hour_on, config.hour_step, day_of_week, config.hour_mode),
      new Minute(minute_on, day_of_week, config.minute_step),
      new Second(second_on, day_of_week, config.second_step)
    );
    this.time_off = new Time(
      new Hour(hour_off, config.hour_step, day_of_week, config.hour_mode),
      new Minute(minute_off, day_of_week, config.minute_step),
      new Second(second_off, day_of_week, config.second_step)
    );
    this.period_on = hour_on >= 12 ? Period.PM : Period.AM;
    this.period_off = hour_off >= 12 ? Period.PM : Period.AM;
    this.day_of_week = day_of_week;
  }
}
