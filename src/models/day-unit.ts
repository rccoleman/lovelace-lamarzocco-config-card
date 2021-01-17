/**
 * Represents a single unit of a datetime oobject - e.g. hours or minutes.
 */
export abstract class DayUnit {
  constructor(private index: number) {}

  private days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  get day_of_week(): string {
    return this.days[this.index];
  }

  toString(): string {
    return this.days[this.index];
  }

  protected isValidString(valueStr: string): boolean {
    return this.days.includes(valueStr);
  }
}
