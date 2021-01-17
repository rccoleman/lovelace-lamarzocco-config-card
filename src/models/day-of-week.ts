import { DayUnit } from './day-unit';

/**
 * Represents the day of week value.
 */
export class DayOfWeek extends DayUnit {
  constructor(value: number) {
    super(value);
  }

  get value(): string {
    return `${this.day_of_week}`;
  }
}
