import { HomeAssistant } from 'custom-card-helpers';
import { ValueRange } from './value-range';
import { HassEntity } from 'home-assistant-js-websocket';
import { ValueDataType } from './types';

export abstract class CardType {
  protected hass!: HomeAssistant;
  protected valueRangeList!: ValueRange[];
  protected entity!: HassEntity;

  public abstract linkStartEnd: boolean;
  public abstract float: boolean;
  public abstract minValue: number;
  public abstract maxValue: number;
  public abstract numValues: number;
  public abstract valueData: Array<ValueDataType>;

  constructor(hass: HomeAssistant, valueRangeList: ValueRange[], entity: HassEntity) {
    this.hass = hass;
    this.valueRangeList = valueRangeList;
    this.entity = entity;
  }

  protected findValueRange(label: string): ValueRange | undefined {
    return this.valueRangeList.find((valueRange) => valueRange.label === label);
  }

  protected findValueRangeIndex(label: string): number | undefined {
    return this.valueRangeList.findIndex((valueRange) => valueRange.label === label);
  }

  abstract funcSet(event: CustomEvent): Promise<void>;

  // Not all card types will have a toggle or on/off
  funcToggle?(valueRange: ValueRange): Promise<void>;
}
