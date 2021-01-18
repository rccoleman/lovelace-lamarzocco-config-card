import { DEFAULT_SECOND_STEP } from '../const';
import { TimeUnit } from './time-unit';

/**
 * * Represents the second value of a datetime.
 */
export class Second extends TimeUnit {
  private static readonly VALUE_LIMIT = 60;

  minValue = 0;
  maxValue = Second.VALUE_LIMIT - 1;

  constructor(value: number, dayOfWeek: string, step = DEFAULT_SECOND_STEP) {
    super(value, step, dayOfWeek);
  }
}
