import { TimeUnit } from './time-unit';

/**
 * Represents the hour value of a datetime.
 */
export class Hour extends TimeUnit {
  minValue = 0;
  maxValue = 23;

  constructor(value: number, dayOfWeek: string) {
    super(value, dayOfWeek);
  }

  togglePeriod(): void {
    this.setValue(this.value + 12);
  }

  toString(): string {
    const value = this.value;

    return value < 10 ? `0${value}` : value.toString();
  }
}
