import { SWITCH_DOMAIN, SERVICE_DOMAIN, MODEL_NAME } from '../const';
import { ValueRange } from '../value-range';
import { CardType } from '../card-type';
import { Models } from '../types';
export class PreinfusionCard extends CardType {
  public float = true;
  public minValue = 0;
  public maxValue = 24.9;
  public valueData = [
    {
      label: 'Key 1',
      attrStart: 'preinfusion_k1',
      attrEnd: undefined,
      attrEnabled: 'state',
    },
    {
      label: 'Key 2',
      attrStart: 'preinfusion_k2',
      attrEnd: undefined,
      attrEnabled: 'state',
    },
    {
      label: 'Key 3',
      attrStart: 'preinfusion_k3',
      attrEnd: undefined,
      attrEnabled: 'state',
    },
    {
      label: 'Key 4',
      attrStart: 'preinfusion_k4',
      attrEnd: undefined,
      attrEnabled: 'state',
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
      'Calling set_preinfusion_time service with %d, %s',
      index,
      valueRange.value_start.toString()
    );

    return this.hass.callService(SERVICE_DOMAIN, 'set_preinfusion_time', {
      key: index,
      seconds: valueRange.value_start.toString(),
    });
  }

  funcToggle(valueRange: ValueRange): Promise<void> {
    if (!this.hass) {
      throw new Error('Unable to update settings');
    }

    const service = valueRange.enabled ? 'turn_on' : 'turn_off';

    console.debug(
      'Calling set_enable_preinfusion %s service with %s',
      service,
      this.entity.entity_id
    );

    for (const vr of this.valueRangeList) {
      vr.enabled = valueRange.enabled;
    }

    return this.hass.callService(SWITCH_DOMAIN, service, {
      entity_id: this.entity.entity_id,
    });
  }
}
