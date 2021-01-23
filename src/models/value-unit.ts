import { Direction } from '../types';

/**
 * Represents a single value.
 */
export class ValueUnit {
  /**
   * The min allowed UI value for this instance.
   */
  public minValue: number;
  /**
   * The max allowed value for this instance.
   */
  public maxValue: number;

  /**
   * The max allowed value for this instance.
   */
  public step: number;

  /**
   * Create a new instance of a ValueUnit
   * @param value current value
   * @param label the day of the week associated with this entity
   */
  constructor(
    public value: number,
    public label: string,
    min: number,
    max: number,
    private float: boolean
  ) {
    this.minValue = min;
    this.maxValue = max;
    this.step = float ? 0.1 : 1;
  }

  /**
   * Sets a value from {@param stringValue}, if it can be parsed and is valid.
   * @param stringValue
   */
  setStringValue(stringValue: string): void {
    if (this.isValidString(stringValue)) {
      this.setValue(this.float ? parseFloat(stringValue) : parseInt(stringValue));
    }
  }

  protected isValidString(valueStr: string): boolean {
    const value = this.float ? parseFloat(valueStr) : parseInt(valueStr);
    return !isNaN(value) && value >= this.minValue && value <= this.maxValue;
  }

  /**
   * Updates the value in {@param direction}.
   * @param direction
   */
  stepUpdate(direction: Direction): void {
    direction === Direction.UP ? this.increment() : this.decrement();
  }

  toString(): string {
    if (this.float) return this.value.toFixed(1);
    else return this.value < 10 ? `0${this.value}` : this.value.toString();
  }

  private increment(): void {
    const newVal = this.value + this.step;
    this.setValue(newVal <= this.maxValue ? newVal : this.maxValue);
  }

  private decrement(): void {
    const newVal = this.value - this.step;
    this.setValue(newVal >= this.minValue ? newVal : this.minValue);
  }

  protected setValue(newValue: number): void {
    if (isNaN(newValue)) {
      return;
    }
    this.value = newValue;
  }
}
