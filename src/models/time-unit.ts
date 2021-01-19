import { Direction } from '../types';

/**
 * Represents a single value.
 */
export abstract class TimeUnit {
  /**
   * The min allowed UI value for this instance.
   */
  abstract minValue: number;
  /**
   * The max allowed value for this instance.
   */
  abstract maxValue: number;

  /**
   * Create a new instance of a TimeUnit
   * @param _value current value
   * @param _dayOfWeek the day of the week associated with this entity
   */
  constructor(private _value: number, protected _dayOfWeek: string) {}

  get value(): number {
    return this._value;
  }

  get dayOfWeek(): string {
    return this._dayOfWeek;
  }

  /**
   * Sets a value from {@param stringValue}, if it can be parsed and is valid.
   * @param stringValue
   */
  setStringValue(stringValue: string): void {
    if (this.isValidString(stringValue)) {
      this.setValue(parseInt(stringValue));
    }
  }

  /**
   * Updates the value in {@param direction}.
   * @param direction
   */
  stepUpdate(direction: Direction): void {
    direction === Direction.UP ? this.increment() : this.decrement();
  }

  toString(): string {
    return this.value < 10 ? `0${this.value}` : this.value.toString();
  }

  private increment(): void {
    const newVal = this.value + 1;
    this.setValue(newVal <= this.maxValue ? newVal : this.maxValue);
  }

  private decrement(): void {
    const newVal = this.value - 1;
    this.setValue(newVal >= this.minValue ? newVal : this.minValue);
  }

  protected setValue(newValue: number): void {
    if (isNaN(newValue)) {
      return;
    }

    this._value = newValue;
  }

  protected isValidString(valueStr: string): boolean {
    const value = parseInt(valueStr);
    return !isNaN(value) && value >= this.minValue && value <= this.maxValue;
  }
}
