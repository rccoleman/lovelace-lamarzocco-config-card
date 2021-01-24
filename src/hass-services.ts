import { HomeAssistant } from 'custom-card-helpers';
import { ENTITY_DOMAIN, SERVICE_DOMAIN } from './const';
import { ValueRange } from './value-range';
import { HassEntity } from 'home-assistant-js-websocket';

export class HassServices {
  private hass!: HomeAssistant;
  private valueRangeList!: ValueRange[];
  private entity!: HassEntity;

  findValueRange(label: string): ValueRange | undefined {
    return this.valueRangeList.find((valueRange) => valueRange.label === label);
  }

  private findValueRangeIndex(label: string): number | undefined {
    return this.valueRangeList.findIndex((valueRange) => valueRange.label === label);
  }

  callSetOnOffTimes(event: CustomEvent): Promise<void> {
    if (!this.hass) {
      throw new Error('Unable to update settings');
    }
    const valueRange = this.findValueRange(event.detail.label);

    if (!valueRange) return Promise.resolve(undefined);

    console.log(
      'Calling set_on_off_times service with %s, %s, %s',
      valueRange.label.toLowerCase(),
      valueRange.value_start.value,
      valueRange.value_end.value
    );

    return this.hass.callService(SERVICE_DOMAIN, 'set_auto_on_off_times', {
      day_of_week: valueRange.label.toLowerCase(),
      hour_on: valueRange.value_start.value,
      hour_off: valueRange.value_end.value,
    });

    // return Promise.resolve(undefined);
  }

  callSetPrebrewTimes(event: CustomEvent): Promise<void> {
    if (!this.hass) {
      throw new Error('Unable to update settings');
    }
    const valueRange = this.findValueRange(event.detail.label);
    let index = this.findValueRangeIndex(event.detail.label);

    if (!valueRange || index === undefined) {
      console.log('Value not found');
      return Promise.resolve(undefined);
    }

    // API expects key values starting at 1
    index++;

    console.log(
      'Calling set_prebrew_times service with %d, %s, %s',
      index,
      valueRange.value_start.toString(),
      valueRange.value_end.toString()
    );

    return this.hass.callService(SERVICE_DOMAIN, 'set_prebrew_times', {
      key: index,
      seconds_on: valueRange.value_start.toString(),
      seconds_off: valueRange.value_end.toString(),
    });

    // return Promise.resolve(undefined);
  }

  callEnableOnOff(valueRange: ValueRange): Promise<void> {
    if (!this.hass) {
      throw new Error('Unable to update settings');
    }

    if (!valueRange) return Promise.resolve(undefined);

    console.log(
      'Calling set_enable_auto_on_off service with %s, %s',
      valueRange.label.toLowerCase(),
      valueRange.enabled
    );

    return this.hass.callService(SERVICE_DOMAIN, 'set_auto_on_off_enable', {
      day_of_week: valueRange.label.toLowerCase(),
      enable: valueRange.enabled,
    });

    // return Promise.resolve(undefined);
  }

  callEnablePrebrew(valueRange: ValueRange): Promise<void> {
    if (!this.hass) {
      throw new Error('Unable to update settings');
    }

    const service = valueRange.enabled ? 'turn_on' : 'turn_off';

    console.log('Calling set_enable_prebrew %s service with %s', service, this.entity.entity_id);

    for (const vr of this.valueRangeList) {
      vr.enabled = valueRange.enabled;
    }

    return this.hass.callService(ENTITY_DOMAIN, service, {
      entity_id: this.entity.entity_id,
    });

    // return Promise.resolve(undefined);
  }
}
