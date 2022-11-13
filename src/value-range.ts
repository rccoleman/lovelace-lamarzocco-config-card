import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import { CardType } from './card-type';
import { ValueUnit } from './models/value-unit';
import { ValueDataType } from './types';
export class ValueRange {
  public value_start: ValueUnit;
  public value_end?: ValueUnit;
  public enabled: boolean;
  public label: string;
  //private _hass: HomeAssistant;

  constructor(
    private hass: HomeAssistant,
    private entityID: string,
    cardType: CardType,
    public valueData: ValueDataType
  ) {
    //this._hass = hass;
    this.label = valueData.label;
    this.enabled = this.isEnabled(hass);
    this.label = valueData.label;

    // on/off times are in the form "HH:MM", prebrew times come in as floats, doses are ints
    let start = this.stateObj(hass).attributes[valueData.attrStart];
    if (!cardType.float && typeof start == 'string') start = parseInt(start.split(':', 1)[0]);

    let end =
      valueData.attrEnd != undefined
        ? this.stateObj(hass).attributes[valueData.attrEnd]
        : undefined;
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

  private stateObj(hass: HomeAssistant): HassEntity {
    return hass.states[this.entityID];
  }

  public updateHass(old_hass: HomeAssistant, new_hass: HomeAssistant): boolean {
    this.hass = new_hass;
    this.enabled = this.isEnabled(new_hass);

    return this.isEnabled(old_hass) != this.isEnabled(new_hass);
  }

  public isEnabled(hass: HomeAssistant): boolean {
    const attr =
      this.valueData.attrEnabled == undefined
        ? 'None'
        : this.stateObj(hass).attributes[this.valueData.attrEnabled];

    return this.valueData.attrEnabled == undefined
      ? true
      : this.valueData.attrEnabled == 'state'
      ? this.stateObj(hass).state == 'on'
      : ['Enabled', 'on', 1].includes(attr);
  }
}
