import { Period, TimePickerCardConfig } from './types';
import { Hour } from './models/hour';
import { Time } from './models/time';

export class Day {
  public time_on!: Time;
  public time_off!: Time;
  public period_on!: Period;
  public period_off!: Period;
  public day_of_week!: string;
  public enabled!: boolean;

  constructor(
    day_of_week: string,
    hour_on: number,
    hour_off: number,
    config: TimePickerCardConfig,
    enabled: boolean
  ) {
    config = config;
    this.time_on = new Time(new Hour(hour_on, day_of_week));
    this.time_off = new Time(new Hour(hour_off, day_of_week));
    this.day_of_week = day_of_week;
    this.enabled = enabled;
  }
}
