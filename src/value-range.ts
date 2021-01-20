import { ValueUnit } from './models/value-unit';
import { ValueRangeCardConfig } from './types';

export const ENTITY_DOMAIN = 'switch';
export const SERVICE_DOMAIN = 'lamarzocco';

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export class ValueRange {
  public value_start: ValueUnit;
  public value_end: ValueUnit;

  constructor(
    public label: string,
    start: number,
    end: number,
    private config: ValueRangeCardConfig,
    public enabled: boolean
  ) {
    config = config;
    this.value_start = new ValueUnit(start, label, 0, end - 1);
    this.value_end = new ValueUnit(end, label, start + 1, 23);
    this.label = label;
    this.enabled = enabled;
  }
}
