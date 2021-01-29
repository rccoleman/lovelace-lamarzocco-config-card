import { HassEntityAttributeBase } from 'home-assistant-js-websocket';
import { CardType } from './card-type';
import { ValueUnit } from './models/value-unit';
import { ValueDataType } from './types';
export class ValueRange {
  public value_start: ValueUnit;
  public value_end?: ValueUnit;
  public enabled: boolean;
  public label: string;

  constructor(
    attributes: HassEntityAttributeBase,
    cardType: CardType,
    public valueData: ValueDataType
  ) {
    this.label = valueData.label;
    this.enabled =
      valueData.attrEnabled == undefined
        ? true
        : attributes[valueData.attrEnabled] == 'Enabled' || attributes[valueData.attrEnabled] == 1;
    this.label = valueData.label;

    // on/off times are in the form "HH:MM", prebrew times come in as floats, doses are ints
    let start = attributes[valueData.attrStart];
    if (!cardType.float && typeof start == 'string') start = parseInt(start.split(':', 1)[0]);

    let end = valueData.attrEnd != undefined ? attributes[valueData.attrEnd] : undefined;
    if (!cardType.float && typeof end == 'string') end = parseInt(end.split(':', 1)[0]);

    this.value_start = new ValueUnit(
      start,
      this.label,
      cardType.minValue,
      cardType.linkStartEnd ? end - 1 : cardType.maxValue,
      cardType.float
    );

    if (end != undefined)
      this.value_end = new ValueUnit(
        end,
        this.label,
        cardType.linkStartEnd ? start + 1 : cardType.minValue,
        cardType.maxValue,
        cardType.float
      );
  }
}
