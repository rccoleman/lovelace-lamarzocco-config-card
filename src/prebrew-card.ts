import { ENTITY_DOMAIN, SERVICE_DOMAIN, MODEL_NAME } from './const';
import { ValueRange } from './value-range';
import { CardType } from './card-type';
import { Models } from './types';
export class PrewBrewCard extends CardType {
  public float = true;
  public minValue = 0;
  public maxValue = 5;
  public valueData = [
    {
      label: 'Key 1',
      attrStart: 'prebrewing_ton_k1',
      attrEnd: 'prebrewing_toff_k1',
      attrEnabled: 'enable_prebrewing',
    },
    {
      label: 'Key 2',
      attrStart: 'prebrewing_ton_k2',
      attrEnd: 'prebrewing_toff_k2',
      attrEnabled: 'enable_prebrewing',
    },
    {
      label: 'Key 3',
      attrStart: 'prebrewing_ton_k3',
      attrEnd: 'prebrewing_toff_k3',
      attrEnabled: 'enable_prebrewing',
    },
    {
      label: 'Key 4',
      attrStart: 'prebrewing_ton_k4',
      attrEnd: 'prebrewing_toff_k4',
      attrEnabled: 'enable_prebrewing',
    },
  ];
  public numValues = this.entity.attributes[MODEL_NAME] == Models.LM ? 1 : this.valueData.length;
  public linkStartEnd = false;

  funcSet(event: CustomEvent): Promise<void> {
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

  funcToggle(valueRange: ValueRange): Promise<void> {
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
