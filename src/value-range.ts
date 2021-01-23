import { ValueUnit } from './models/value-unit';
import { CardSettings, ValueDataType, ValueRangeCardConfig } from './types';
export class ValueRange {
  public value_start: ValueUnit;
  public value_end: ValueUnit;

  constructor(
    public label: string,
    start: number,
    end: number,
    public enabled: boolean,
    private config: ValueRangeCardConfig,
    private cardSettings: CardSettings,
    public valueData: ValueDataType
  ) {
    config = config;
    this.value_start = new ValueUnit(
      start,
      label,
      cardSettings.minValue,
      cardSettings.linkStartEnd ? end - 1 : cardSettings.maxValue,
      cardSettings.float
    );
    this.value_end = new ValueUnit(
      end,
      label,
      cardSettings.linkStartEnd ? start + 1 : cardSettings.minValue,
      cardSettings.maxValue,
      cardSettings.float
    );
    this.label = label;
    this.enabled = enabled;
  }
}
