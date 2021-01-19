import { ValueUnit } from './models/value-unit';
import { ValueRangeCardConfig } from './types';

export const ENTITY_DOMAIN = 'switch';
export const SERVICE_DOMAIN = 'lamarzocco';

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export class Value {
  public value_start: ValueUnit;
  public value_end: ValueUnit;

  constructor(
    public label: string,
    public start: number,
    public end: number,
    private config: ValueRangeCardConfig,
    public enabled: boolean
  ) {
    config = config;
    this.value_start = new ValueUnit(this.start, label);
    this.value_end = new ValueUnit(this.end, label);
    this.label = label;
    this.enabled = enabled;
  }
}
