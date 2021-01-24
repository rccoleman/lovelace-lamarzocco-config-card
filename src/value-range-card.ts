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
import { ENTITY_DOMAIN, CARD_SIZE, CARD_VERSION } from './const';
import { HassServices } from './hass-services';
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
      { label: 'Sun', attrStart: 'sun_on_time', attrEnd: 'sun_off_time', attrEnabled: 'sun_auto' },
      { label: 'Mon', attrStart: 'mon_on_time', attrEnd: 'mon_off_time', attrEnabled: 'mon_auto' },
      { label: 'Tue', attrStart: 'tue_on_time', attrEnd: 'tue_off_time', attrEnabled: 'tue_auto' },
      { label: 'Wed', attrStart: 'wed_on_time', attrEnd: 'wed_off_time', attrEnabled: 'wed_auto' },
      { label: 'Thu', attrStart: 'thu_on_time', attrEnd: 'thu_off_time', attrEnabled: 'thu_auto' },
      { label: 'Fri', attrStart: 'fri_on_time', attrEnd: 'fri_off_time', attrEnabled: 'fri_auto' },
      { label: 'Sat', attrStart: 'sat_on_time', attrEnd: 'sat_off_time', attrEnabled: 'sat_auto' },
    ],
    linkStartEnd: true,
    funcToggle: HassServices.prototype.callEnableOnOff,
    funcSet: HassServices.prototype.callSetOnOffTimes,
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
    funcToggle: HassServices.prototype.callEnablePrebrew,
    funcSet: HassServices.prototype.callSetPrebrewTimes,
  };

  private valueRangeList!: ValueRange[];
  private cardSettings!: CardSettings;
  private hassServices!: HassServices;

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
    };
  }

  private get buttonLabelClass(): ClassInfo {
    return {
      'value-range-button-label': true,
    };
  }

  render(): TemplateResult | null {
    if (!this.entity) {
      return Partial.error('Entity not found', this.config);
    }

    if (computeDomain(this.entity.entity_id) !== ENTITY_DOMAIN) {
      return Partial.error(`You must set an ${ENTITY_DOMAIN} entity`, this.config);
    }

    // Create objects on first run
    if (typeof this.valueRangeList === 'undefined') {
      this.valueRangeList = [];

      for (const value of this.cardSettings.valueData) {
        const valueRange = new ValueRange(
          this.entity.attributes,
          this.config,
          this.cardSettings,
          value
        );
        this.valueRangeList.push(valueRange);
      }

      this.hassServices = new HassServices(this.hass, this.entity, this.valueRangeList);

      if (this.config.card_type == CardType.AUTO_ON_OFF) {
        this.cardSettings.funcSet = this.hassServices.callSetOnOffTimes;
        this.cardSettings.funcToggle = this.hassServices.callEnableOnOff;
      } else {
        this.cardSettings.funcSet = this.hassServices.callSetPrebrewTimes;
        this.cardSettings.funcToggle = this.hassServices.callEnablePrebrew;
      }
    }

    for (const valueRange of this.valueRangeList) {
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

  findValueRange(label: string): ValueRange | undefined {
    return this.valueRangeList.find((valueRange) => valueRange.label === label);
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
        justify-content: center;
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
