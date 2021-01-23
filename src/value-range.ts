import { HassEntityAttributeBase } from 'home-assistant-js-websocket';
import { ValueUnit } from './models/value-unit';
import { CardSettings, ValueDataType, ValueRangeCardConfig } from './types';
export class ValueRange {
  public value_start: ValueUnit;
  public value_end: ValueUnit;
  public enabled: boolean;
  public label: string;

  constructor(
    private attributes: HassEntityAttributeBase,
    private config: ValueRangeCardConfig,
    private cardSettings: CardSettings,
    public valueData: ValueDataType
  ) {
    this.label = valueData.label;
    this.enabled =
      attributes[valueData.attrEnabled] == 'Enabled' || attributes[valueData.attrEnabled] == 1;
    this.label = valueData.label;

    this.value_start = new ValueUnit(
      attributes[valueData.attrStart],
      this.label,
      cardSettings.minValue,
      cardSettings.linkStartEnd ? attributes[valueData.attrEnd] - 1 : cardSettings.maxValue,
      cardSettings.float
    );

    this.value_end = new ValueUnit(
      attributes[valueData.attrEnd],
      this.label,
      cardSettings.linkStartEnd ? attributes[valueData.attrStart] + 1 : cardSettings.minValue,
      cardSettings.maxValue,
      cardSettings.float
    );
  }
}
