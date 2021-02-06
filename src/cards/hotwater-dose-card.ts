import { SERVICE_DOMAIN } from '../const';
import { CardType } from '../card-type';
export class HotWaterDoseCard extends CardType {
  public float = false;
  public minValue = 0;
  public maxValue = 1000;
  public valueData = [
    {
      label: 'Hot Water',
      attrStart: 'dose_hot_water',
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

    if (!valueRange) {
      console.log('Value not found');
      return Promise.resolve(undefined);
    }

    console.log('Calling set_dose_hot_water service with %s', valueRange.value_start.toString());

    return this.hass.callService(SERVICE_DOMAIN, 'set_dose_hot_water', {
      seconds: valueRange.value_start.toString(),
    });

    // return Promise.resolve(undefined);
  }
}
