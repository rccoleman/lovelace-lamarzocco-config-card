import { SERVICE_DOMAIN } from '../const';
import { ValueRange } from '../value-range';
import { CardType } from '../card-type';

export class AutoOnOffCard extends CardType {
  public float = false;
  public minValue = 0;
  public maxValue = 23;
  public valueData = [
    { label: 'Sun', attrStart: 'sun_on_time', attrEnd: 'sun_off_time', attrEnabled: 'sun_auto' },
    { label: 'Mon', attrStart: 'mon_on_time', attrEnd: 'mon_off_time', attrEnabled: 'mon_auto' },
    { label: 'Tue', attrStart: 'tue_on_time', attrEnd: 'tue_off_time', attrEnabled: 'tue_auto' },
    { label: 'Wed', attrStart: 'wed_on_time', attrEnd: 'wed_off_time', attrEnabled: 'wed_auto' },
    { label: 'Thu', attrStart: 'thu_on_time', attrEnd: 'thu_off_time', attrEnabled: 'thu_auto' },
    { label: 'Fri', attrStart: 'fri_on_time', attrEnd: 'fri_off_time', attrEnabled: 'fri_auto' },
    { label: 'Sat', attrStart: 'sat_on_time', attrEnd: 'sat_off_time', attrEnabled: 'sat_auto' },
  ];
  public numValues = this.valueData.length;
  public linkStartEnd = true;

  funcSet(event: CustomEvent): Promise<void> {
    if (!this.hass) {
      throw new Error('Unable to update settings');
    }
    const valueRange = this.findValueRange(event.detail.label);

    if (!valueRange) return Promise.resolve(undefined);

    console.log(
      'Calling set_on_off_times service with %s, %s, %s',
      valueRange.label.toLowerCase(),
      valueRange.value_start.value,
      valueRange.value_end?.value
    );

    return this.hass.callService(SERVICE_DOMAIN, 'set_auto_on_off_times', {
      day_of_week: valueRange.label.toLowerCase(),
      hour_on: valueRange.value_start.value,
      hour_off: valueRange.value_end?.value,
    });

    // return Promise.resolve(undefined);
  }

  funcToggle(valueRange: ValueRange): Promise<void> {
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
  }
}
