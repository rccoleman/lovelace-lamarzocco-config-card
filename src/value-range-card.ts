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
import { ENTITY_DOMAIN, CARD_SIZE, CARD_VERSION, MODEL_NAME } from './const';
import { CardType } from './card-type';
import { ValueRange } from './value-range';
import { Partial } from './partials';
import { CardSettingsType, Layout, ValueRangeCardConfig, ValueType, Models } from './types';
import { PrewBrewCard } from './prebrew-card';
import { AutoOnOffCard } from './autoonoff-card';
import { DoseCard } from './dose-card';

console.info(
  `%c  VALUE-RANGE-CARD  \n%c  Version ${CARD_VERSION}    `,
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
  private cardType!: CardType;

  private valueRangeList!: ValueRange[];

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

    if (
      this.config.card_type == CardSettingsType.PREBREW &&
      this.entity.attributes[MODEL_NAME] == Models.GS3_MP
    ) {
      return Partial.error('Prebrew card is not available for the GS3 MP', this.config);
    }

    if (
      this.config.card_type == CardSettingsType.DOSE &&
      (this.entity.attributes[MODEL_NAME] == Models.GS3_MP ||
        this.entity.attributes[MODEL_NAME] == Models.LM)
    ) {
      return Partial.error('Dose card is not available for the GS3 MP or Linea Mini', this.config);
    }

    // Create objects on first run
    if (typeof this.valueRangeList === 'undefined') {
      this.valueRangeList = [];

      switch (this.config.card_type) {
        case CardSettingsType.AUTO_ON_OFF:
          this.cardType = new AutoOnOffCard(this.hass, this.valueRangeList, this.entity);
          break;
        case CardSettingsType.PREBREW:
          this.cardType = new PrewBrewCard(this.hass, this.valueRangeList, this.entity);
          break;
        case CardSettingsType.DOSE:
          this.cardType = new DoseCard(this.hass, this.valueRangeList, this.entity);
      }

      for (let i = 0; i < this.cardType.numValues; i++) {
        const valueRange = new ValueRange(
          this.entity.attributes,
          this.cardType,
          this.cardType.valueData[i]
        );
        this.valueRangeList.push(valueRange);
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
        ${
          valueRange.value_end != undefined
            ? html`<value-unit
                .unit=${valueRange.value_end}
                @stepChange=${(e: CustomEvent) => this.onValueStepChange(e, ValueType.END)}
                @update=${this.onValueInputChange}
              ></value-unit>`
            : ''
        }
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
    if (valueRange && this.cardType.linkStartEnd && valueRange.value_end != undefined) {
      valueRange.value_start.maxValue = valueRange.value_end.value - 1;
      valueRange.value_end.minValue = valueRange.value_start.value + 1;
    }
  }

  private onEnableDisable(event: CustomEvent, valueRange: ValueRange): void {
    if (this.cardType.funcToggle != undefined) {
      event = event;
      valueRange.enabled = !valueRange.enabled;

      this.setButtonColors(valueRange);
      this.cardType.funcToggle(valueRange);
    }
  }

  findValueRange(label: string): ValueRange | undefined {
    return this.valueRangeList.find((valueRange) => valueRange.label === label);
  }

  private onValueInputChange(event: CustomEvent): void {
    const valueRange = this.findValueRange(event.detail.label);

    if (valueRange) {
      this.adjustMinMax(valueRange);
      this.cardType.funcSet(event);
    }
  }

  private onValueStepChange(event: CustomEvent, valueType: ValueType): void {
    const valueRange = this.findValueRange(event.detail.label);
    if (valueRange) {
      const valueUnit =
        valueType === ValueType.START ? valueRange.value_start : valueRange.value_end;

      if (valueUnit) {
        const orig_value = valueUnit.value;
        valueUnit.stepUpdate(event.detail.direction);

        if (orig_value != valueUnit.value) {
          this.adjustMinMax(valueRange);
          this.cardType.funcSet(event);
        }
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
