import { computeDomain, HomeAssistant, LovelaceCard } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from 'lit-element';
import { repeat } from 'lit-html/directives/repeat.js';
import { ClassInfo, classMap } from 'lit-html/directives/class-map';
import './components/value-unit.component';
import {
  ENTITY_DOMAIN,
  SERVICE_DOMAIN,
  CARD_SIZE,
  CARD_VERSION,
  DEFAULT_LAYOUT_ALIGN_CONTROLS,
} from './const';

import { ValueRange } from './value-range';

import { Partial } from './partials';
import { CardType, Layout, ValueRangeCardConfig, ValueType, CardSettings } from './types';

console.info(
  `%c  VALU-RANGE-CARD  \n%c  Version ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'value-range-card',
  name: 'Value Range Card',
  description: 'A Value Range card for assigning multiple sets of upper/lower values.',
});
@customElement('value-range-card')
export class ValueRangeCard extends LitElement implements LovelaceCard {
  @property({ type: Object }) hass!: HomeAssistant;
  @property({ attribute: false }) private config!: ValueRangeCardConfig;

  SETTINGS_AUTO_ON_OFF: CardSettings = {
    float: false,
    minValue: 0,
    maxValue: 23,
    valueData: [
      { label: 'Sun', attrStart: 'sun_on_hour', attrEnd: 'sun_off_hour', attrEnabled: 'sun' },
      { label: 'Mon', attrStart: 'mon_on_hour', attrEnd: 'mon_off_hour', attrEnabled: 'mon' },
      { label: 'Tue', attrStart: 'tue_on_hour', attrEnd: 'tue_off_hour', attrEnabled: 'tue' },
      { label: 'Wed', attrStart: 'wed_on_hour', attrEnd: 'wed_off_hour', attrEnabled: 'wed' },
      { label: 'Thu', attrStart: 'thu_on_hour', attrEnd: 'thu_off_hour', attrEnabled: 'thu' },
      { label: 'Fri', attrStart: 'fri_on_hour', attrEnd: 'fri_off_hour', attrEnabled: 'fri' },
      { label: 'Sat', attrStart: 'sat_on_hour', attrEnd: 'sat_off_hour', attrEnabled: 'sat' },
    ],
    linkStartEnd: true,
    funcToggle: ValueRangeCard.prototype.callEnableOnOff,
    funcSet: ValueRangeCard.prototype.callSetOnOffTimes,
  };

  SETTINGS_PREBREW: CardSettings = {
    float: true,
    minValue: 0,
    maxValue: 5,
    valueData: [
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
    ],
    linkStartEnd: false,
    funcToggle: ValueRangeCard.prototype.callEnablePrebrew,
    funcSet: ValueRangeCard.prototype.callSetPrebrewTimes,
  };

  private valueRangeList!: ValueRange[];
  private cardSettings!: CardSettings;

  private get entity(): HassEntity {
    return this.hass.states[this.config.entity];
  }

  private get isEmbedded(): boolean {
    return this.config.layout?.embedded === true;
  }

  private get hasNameInHeader(): boolean {
    return (
      Boolean(this.name) &&
      Boolean(this.config.hide?.name) === false &&
      this.config.layout?.name !== Layout.Name.INSIDE &&
      Boolean(this.config.layout?.embedded) === false
    );
  }

  private get hasNameInside(): boolean {
    return (
      Boolean(this.name) &&
      Boolean(this.config.hide?.name) === false &&
      (this.config.layout?.name === Layout.Name.INSIDE || Boolean(this.config.layout?.embedded))
    );
  }

  private get name(): string | undefined {
    return this.config.name || this.entity?.attributes.friendly_name;
  }

  private get shouldShowPeriod(): boolean {
    return this.config.hour_mode === 12;
  }

  private get layoutAlign(): Layout.AlignControls {
    return this.config.layout?.align_controls ?? DEFAULT_LAYOUT_ALIGN_CONTROLS;
  }

  private get rowClass(): ClassInfo {
    return {
      'value-range-row': true,
      'with-header-name': this.hasNameInHeader,
      embedded: this.isEmbedded,
    };
  }

  private get controlClass(): ClassInfo {
    return {
      'value-range-control': true,
      [`layout-${this.layoutAlign}`]: true,
    };
  }

  private get buttonLabelClass(): ClassInfo {
    return {
      'value-range-button-label': true,
      [`layout-${this.layoutAlign}`]: true,
    };
  }

  render(): TemplateResult | null {
    if (!this.entity) {
      return Partial.error('Entity not found', this.config);
    }

    if (computeDomain(this.entity.entity_id) !== ENTITY_DOMAIN) {
      return Partial.error(`You must set an ${ENTITY_DOMAIN} entity`, this.config);
    }

    if (typeof this.valueRangeList === 'undefined') {
      this.valueRangeList = [];

      for (const value of this.cardSettings.valueData) {
        const valueRange = new ValueRange(
          value.label,
          this.entity!.attributes[value.attrStart],
          this.entity!.attributes[value.attrEnd],
          this.entity!.attributes[value.attrEnabled] == 'Enabled' ||
            this.entity!.attributes[value.attrEnabled] == 1,
          this.config,
          this.cardSettings,
          value
        );
        this.valueRangeList.push(valueRange);
      }
    }

    for (const valueRange of this.valueRangeList) {
      // Update values
      // const valueData = valueRange.valueData;
      // const attr = this.entity!.attributes;

      // if (valueRange.value_start.value != attr[valueData.attrStart]) {
      //   console.log('start: ' + valueData.attrStart + ': ' + attr[valueData.attrStart]);
      // }
      // if (valueRange.value_end.value != attr[valueData.attrEnd]) {
      //   console.log('end: ' + valueData.attrEnd + ': ' + attr[valueData.attrEnd]);
      // }
      // if (
      //   valueRange.enabled !=
      //   (attr[valueData.attrEnabled] == 1 || attr[valueData.attrEnabled] == 'Enabled')
      // ) {
      //   console.log('enabled: ' + valueData.attrEnabled + ': ' + attr[valueData.attrEnabled]);
      // }

      // valueRange.value_start.value = attr[valueData.attrStart];
      // valueRange.value_end.value = attr[valueData.attrEnd];
      // valueRange.enabled =
      //   attr[valueData.attrEnabled] == 'Enabled' || attr[valueData.attrEnabled] == 1;

      this.setButtonColors(valueRange);
    }

    return html` ${this.hasNameInHeader ? Partial.headerName(this.name!) : ''}
      <ha-card class=${classMap(this.rowClass)}>
        ${this.hasNameInside ? Partial.nestedName(this.name!, this.entity) : ''}
        ${repeat(
          this.valueRangeList,
          (valueRange) => html`
        <div class=${classMap(this.controlClass)}>
        <button class=${classMap(this.buttonLabelClass)} @click="${(e: CustomEvent) =>
            this.onEnableDisable(e, valueRange)}}" id=${valueRange.label}>${
            valueRange.label
          }</button>
        <value-unit
            .unit=${valueRange.value_start}
            @stepChange=${(e: CustomEvent) => this.onValueStepChange(e, ValueType.START)}
            @update=${this.onValueInputChange}
        ></value-unit>
        <value-unit
            .unit=${valueRange.value_end}
            @stepChange=${(e: CustomEvent) => this.onValueStepChange(e, ValueType.END)}
            @update=${this.onValueInputChange}
        ></value-unit>
        </div>
    </div></div>`
        )}
      </ha-card>`;
  }

  setConfig(config: ValueRangeCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    if (!config.entity) {
      throw new Error('You must set an entity');
    }

    this.config = config;

    this.cardSettings =
      config.card_type == CardType.AUTO_ON_OFF ? this.SETTINGS_AUTO_ON_OFF : this.SETTINGS_PREBREW;
  }

  getCardSize(): number {
    return CARD_SIZE;
  }

  private setButtonColors(valueRange: ValueRange): void {
    const root = this.shadowRoot;
    const button = root!.getElementById(valueRange.label);
    if (button) {
      const color = valueRange.enabled ? 'var(--success-color)' : 'var(--tpc-off-color)';
      button.style.color = color;
      button.style.border = '2px solid ' + color;
    }
  }

  private adjustMinMax(valueRange: ValueRange): void {
    if (valueRange && this.cardSettings.linkStartEnd) {
      valueRange.value_start.maxValue = valueRange.value_end.value - 1;
      valueRange.value_end.minValue = valueRange.value_start.value + 1;
    }
  }

  private onEnableDisable(event: CustomEvent, valueRange: ValueRange): void {
    event = event;
    valueRange.enabled = !valueRange.enabled;

    this.setButtonColors(valueRange);
    this.cardSettings.funcToggle.call(this, valueRange);
  }

  private findValueRange(label: string): ValueRange | undefined {
    return this.valueRangeList.find((valueRange) => valueRange.label === label);
  }

  private findValueRangeIndex(label: string): number | undefined {
    return this.valueRangeList.findIndex((valueRange) => valueRange.label === label);
  }

  private onValueInputChange(event: CustomEvent): void {
    const valueRange = this.findValueRange(event.detail.label);

    if (valueRange) {
      this.adjustMinMax(valueRange);
      this.cardSettings.funcSet.call(this, event);
    }
  }

  private onValueStepChange(event: CustomEvent, valueType: ValueType): void {
    const valueRange = this.findValueRange(event.detail.label);
    if (valueRange) {
      const valueUnit =
        valueType === ValueType.START ? valueRange.value_start : valueRange.value_end;

      const orig_value = valueUnit.value;
      valueUnit.stepUpdate(event.detail.direction);

      if (orig_value != valueUnit.value) {
        this.adjustMinMax(valueRange);
        this.cardSettings.funcSet.call(this, event);
      }
    }
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

  static get styles(): CSSResult {
    return css`
      :host {
        --tpc-elements-background-color: var(
          --value-range-elements-background-color,
          var(--primary-color)
        );

        --tpc-icon-color: var(--value-range-icon-color, var(--primary-text-color));
        --tpc-text-color: var(--value-range-text-color, #fff);
        --tpc-accent-color: var(--value-range-accent-color, var(--primary-color));
        --tpc-off-color: var(--value-range-off-color, var(--disabled-text-color));

        --tpc-border-radius: var(--value-range-border-radius, var(--ha-card-border-radius, 4px));
      }

      ha-card.embedded {
        box-shadow: none;
      }

      .value-range-header {
        padding: 0px;
        color: var(--tpc-text-color);
        background-color: var(--tpc-elements-background-color);
        border-top-left-radius: var(--tpc-border-radius);
        border-top-right-radius: var(--tpc-border-radius);
        font-size: 1em;
        text-align: center;
      }

      .value-range-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 2px;
      }

      .value-range-control {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px;
      }

      .value-range-button-label {
        background-color: var(--primary-background-color);
        color: var(--tpc-text-color);
        border: 2px solid var(--success-color);
        font-weight: bolder;
      }

      .value-range-row.embedded {
        padding: 2;
        justify-content: center;
      }

      .value-range-row.with-header-name {
        padding: 6px 6px 6px;
        justify-content: center;
      }

      .value-range-content {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex: 1 0 auto;
      }

      .value-range-content.layout-left {
        justify-content: flex-start;
      }

      .value-range-content.layout-center {
        justify-content: center;
      }

      .value-range-content.layout-right {
        justify-content: flex-end;
      }

      .entity-name-inside {
        margin-left: 16px;
      }
    `;
  }

  static getStubConfig(
    _: HomeAssistant,
    entities: Array<string>
  ): Omit<ValueRangeCardConfig, 'type'> {
    const cardEntity = entities.find((entityId) => computeDomain(entityId) === ENTITY_DOMAIN);

    return {
      entity: cardEntity || 'switch.buzz_auto_on_off',
    };
  }

  static getConfigElement(): LovelaceCard {
    return document.createElement('value-range-card-editor') as LovelaceCard;
  }
}
