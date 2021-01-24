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

    // on/off times are in the form "HH:MM", prebrew times come in as floats
    let start = attributes[valueData.attrStart];
    if (!cardSettings.float) start = parseInt(start.split(':', 1)[0]);

    let end = attributes[valueData.attrEnd];
    if (!cardSettings.float) end = parseInt(end.split(':', 1)[0]);

    this.value_start = new ValueUnit(
      start,
      this.label,
      cardSettings.minValue,
      cardSettings.linkStartEnd ? end - 1 : cardSettings.maxValue,
      cardSettings.float
    );

    this.value_end = new ValueUnit(
      end,
      this.label,
      cardSettings.linkStartEnd ? start + 1 : cardSettings.minValue,
      cardSettings.maxValue,
      cardSettings.float
    );
  }
}
