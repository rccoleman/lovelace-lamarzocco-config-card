import { SERVICE_DOMAIN } from './const';
import { CardType } from './card-type';
export class DoseCard extends CardType {
  public float = false;
  public minValue = 0;
  public maxValue = 1000;
  public valueData = [
    {
      label: 'Key 1',
      attrStart: 'dose_k1',
      attrEnd: undefined,
      attrEnabled: undefined,
    },
    {
      label: 'Key 2',
      attrStart: 'dose_k2',
      attrEnd: undefined,
      attrEnabled: undefined,
    },
    {
      label: 'Key 3',
      attrStart: 'dose_k3',
      attrEnd: undefined,
      attrEnabled: undefined,
    },
    {
      label: 'Key 4',
      attrStart: 'dose_k4',
      attrEnd: undefined,
      attrEnabled: undefined,
    },
    {
      label: 'Key 5',
      attrStart: 'dose_k5',
      attrEnd: undefined,
      attrEnabled: undefined,
    },
  ];
  public numValues = this.valueData.length;
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

    console.log('Calling set_dose service with %d, %s', index, valueRange.value_start.toString());

    return this.hass.callService(SERVICE_DOMAIN, 'set_dose', {
      key: index,
      pulses: valueRange.value_start.toString(),
    });

    // return Promise.resolve(undefined);
  }
}
