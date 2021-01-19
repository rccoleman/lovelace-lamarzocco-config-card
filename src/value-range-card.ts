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
import { CARD_SIZE, CARD_VERSION, DEFAULT_LAYOUT_ALIGN_CONTROLS } from './const';

import { ENTITY_DOMAIN, SERVICE_DOMAIN, DAYS, Value } from './value';

import { Partial } from './partials';
import { Layout, ValueRangeCardConfig } from './types';

console.info(
  `%c  value-range-CARD  \n%c  Version ${CARD_VERSION}    `,
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
  private valueMap!: Map<string, Value>;

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
      Boolean(this.config.layout?.embedded) === false // embedded layout disables name in header
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

  private get haCardClass(): ClassInfo {
    return {
      embedded: this.isEmbedded,
    };
  }

  private get rowClass(): ClassInfo {
    return {
      'value-range-row': true,
      'with-header-name': this.hasNameInHeader,
      embedded: this.isEmbedded,
    };
  }

  private get contentClass(): ClassInfo {
    return {
      'value-range-control': true,
      [`layout-${this.layoutAlign}`]: true,
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

    if (typeof this.valueMap === 'undefined') {
      this.valueMap = new Map();

      for (const label of DAYS) {
        const value = new Value(
          label,
          this.entity!.attributes[label.toLowerCase() + '_on'],
          this.entity!.attributes[label.toLowerCase() + '_off'],
          this.config,
          this.entity!.attributes[label.toLowerCase()] === 'Enabled'
        );
        this.valueMap.set(label, value);
      }
    }

    for (const value of this.valueMap.values()) {
      // Update values
      const index = value.label.toLowerCase();
      const attr = this.entity!.attributes;

      value.value_start.value = attr[index + '_on'];
      value.value_end.value = attr[index + '_off'];
      value.enabled = attr[index] === 'Enabled';

      this.setButtonColors(value);
    }

    return html` ${this.hasNameInHeader ? Partial.headerName(this.name!) : ''}
      <ha-card class=${classMap(this.rowClass)}>
        ${this.hasNameInside ? Partial.nestedName(this.name!, this.entity) : ''}
        ${repeat(
          this.valueMap.values(),
          (value) => html`
        <div class=${classMap(this.controlClass)}>
        <button class=${classMap(this.buttonLabelClass)} @click="${(e: CustomEvent) =>
            this.onEnableDisable(e, value)}}" id=${value.label}>${value.label}</button>
        <value-unit
            .unit=${value.value_start.value}
            @stepChange=${this.onHourOnStepChange}
            @update=${this.callSetOnOffHours}
        ></value-unit>
        <value-unit
            .unit=${value.value_end.value}
            @stepChange=${this.onHourOffStepChange}
            @update=${this.callSetOnOffHours}
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

    if (config.hour_mode && config.hour_mode !== 12 && config.hour_mode !== 24) {
      throw new Error('Invalid hour_mode: select either 12 or 24');
    }

    this.config = config;
  }

  getCardSize(): number {
    return CARD_SIZE;
  }

  private setButtonColors(value: Value): void {
    const root = this.shadowRoot;
    const button = root!.getElementById(value.label);
    if (button) {
      const color = value.enabled ? 'var(--success-color)' : 'var(--tpc-off-color)';
      button.style.color = color;
      button.style.border = '2px solid ' + color;
    }
  }

  private adjustMinMax(value: Value): void {
    if (value) {
      value.value_start.maxValue = value.value_start.value - 1;
      value.value_end.minValue = value.value_end.value + 1;
    }
  }

  private onEnableDisable(event: CustomEvent, value: Value): void {
    event = event;
    value.enabled = !value.enabled;

    this.setButtonColors(value);
    this.callEnableDisable(value);
  }

  private onHourOnStepChange(event: CustomEvent): void {
    const value = this.valueMap.get(event.detail.dayOfWeek);
    if (value) {
      value.value_start.stepUpdate(event.detail.direction);
      this.adjustMinMax(value);
      this.callSetOnOffHours(event);
    }
  }

  private onHourOffStepChange(event: CustomEvent): void {
    const value = this.valueMap.get(event.detail.dayOfWeek);
    if (value) {
      value.value_start.stepUpdate(event.detail.direction);
      this.adjustMinMax(value);
      this.callSetOnOffHours(event);
    }
  }

  private callSetOnOffHours(event: CustomEvent): Promise<void> {
    if (!this.hass) {
      throw new Error('Unable to update settings');
    }
    const value = this.valueMap.get(event.detail.dayOfWeek);

    if (!value) return Promise.resolve(undefined);

    console.log(
      'Calling set_on_off_hours service with %s, %s, %s',
      value.label.toLowerCase(),
      value.value_start.value,
      value.value_end.value
    );

    return this.hass.callService(SERVICE_DOMAIN, 'set_auto_on_off_hours', {
      day_of_week: value.label.toLowerCase(),
      hour_on: value.value_start.value,
      hour_off: value.value_end.value,
    });

    // return Promise.resolve(undefined);
  }

  private callEnableDisable(value: Value): Promise<void> {
    if (!this.hass) {
      throw new Error('Unable to update settings');
    }

    if (!value) return Promise.resolve(undefined);

    console.log(
      'Calling set_enable_auto_on_off service with %s, %s',
      value.label.toLowerCase(),
      value.enabled
    );

    return this.hass.callService(SERVICE_DOMAIN, 'set_auto_on_off_enable', {
      day_of_week: value.label.toLowerCase(),
      enable: value.enabled,
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
