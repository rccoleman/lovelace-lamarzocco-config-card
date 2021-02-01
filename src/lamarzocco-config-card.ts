import { HomeAssistant, LovelaceCard } from 'custom-card-helpers';
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
import { CARD_SIZE, CARD_VERSION, MODEL_NAME } from './const';
import { CardType } from './card-type';
import { ValueRange } from './value-range';
import { Partial } from './partials';
import { CardSettingsType, LaMarzoccoConfigCardConfig, ValueType, Models } from './types';
import { PrewBrewCard } from './prebrew-card';
import { AutoOnOffCard } from './autoonoff-card';
import { DoseCard } from './dose-card';

console.info(
  `%c  LA-MARZOCCO-CONFIG-CARD  \n%c  Version ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'lamarzocco-config-card',
  name: 'La Marzocco Config Card',
  preview: true,
  description:
    'A card that allows configuration of an network-connected La Marzocco espresso machine.',
});
@customElement('lamarzocco-config-card')
export class LaMarzoccoConfigCard extends LitElement implements LovelaceCard {
  @property({ type: Object }) hass!: HomeAssistant;
  @property({ attribute: false }) private config!: LaMarzoccoConfigCardConfig;
  private cardType!: CardType;
  private valueRangeList: ValueRange[] = [];
  private hassEntity!: HassEntity;

  private get entity(): HassEntity {
    return this.hassEntity;
  }

  private get hasNameInHeader(): boolean {
    return Boolean(this.name) && Boolean(this.config.hide?.name) === false;
  }

  private get name(): string | undefined {
    return this.config.name || this.entity?.attributes.friendly_name;
  }

  private get rowClass(): ClassInfo {
    return {
      'lmcc-row': true,
      'with-header-name': this.hasNameInHeader,
    };
  }

  private get controlClass(): ClassInfo {
    return {
      'lmcc-control': true,
    };
  }

  private get buttonLabelClass(): ClassInfo {
    return {
      'lmcc-button-label': true,
    };
  }

  render(): TemplateResult | null {
    const entity = LaMarzoccoConfigCard.getEntityFromCardType(this.hass, this.config.card_type);

    if (entity === undefined) {
      return Partial.error('Entity not found', this.config);
    }

    this.hassEntity = entity;

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
    if (this.valueRangeList.length === 0) {
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

    return html` <ha-card>
      ${this.hasNameInHeader ? Partial.headerName(this.name!) : ''}
      <div class=${classMap(this.rowClass)}>
        ${repeat(
          this.valueRangeList,
          (valueRange) => html`
        <div class=${classMap(this.controlClass)}>
        <button class=${classMap(this.buttonLabelClass)} @click="${() =>
            this.onEnableDisable(valueRange)}}" id=${valueRange.label}>${valueRange.label}</button>
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
      </div>
    </ha-card>`;
  }

  setConfig(config: LaMarzoccoConfigCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    if (
      config.card_type != CardSettingsType.AUTO_ON_OFF &&
      config.card_type != CardSettingsType.PREBREW &&
      config.card_type != CardSettingsType.DOSE
    ) {
      throw new Error('Invalid card type');
    }

    this.valueRangeList = [];
    this.config = config;
  }

  getCardSize(): number {
    return CARD_SIZE;
  }

  private setButtonColors(valueRange: ValueRange): void {
    const root = this.shadowRoot;
    const button = root!.getElementById(valueRange.label);
    if (button) {
      const color = valueRange.enabled ? 'var(--success-color)' : 'var(--lmcc-off-color)';
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

  private onEnableDisable(valueRange: ValueRange): void {
    if (this.cardType.funcToggle != undefined) {
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
      ha-card {
        --lmcc-elements-background-color: var(
          --lamarzocco-config-elements-background-color,
          var(--primary-color)
        );

        --lmcc-icon-color: var(--lamarzocco-config-icon-color, var(--primary-text-color));
        --lmcc-text-color: var(--lamarzocco-config-text-color, #fff);
        --lmcc-accent-color: var(--lamarzocco-config-accent-color, var(--primary-color));
        --lmcc-off-color: var(--lamarzocco-config-off-color, var(--disabled-text-color));
        --lmcc-border-color: var(--lamarzocco-config-border-color, var(--primary-color));

        --lmcc-border-radius: var(
          --lamarzocco-config-border-radius,
          var(--ha-card-border-radius, 4px)
        );
      }

      .lmcc-header {
        padding: 0px;
        color: var(--lmcc-text-color);
        background-color: var(--lmcc-elements-background-color);
        border-top-left-radius: var(--lmcc-border-radius);
        border-top-right-radius: var(--lmcc-border-radius);
        font-size: 1em;
        text-align: center;
      }

      .lmcc-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 2px;
      }

      .lmcc-control {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px;
      }

      .lmcc-button-label {
        background-color: var(--primary-background-color);
        color: var(--lmcc-text-color);
        border: 2px solid var(--success-color);
        font-weight: bolder;
      }

      .lmcc-row.with-header-name {
        padding: 6px 6px 6px;
        justify-content: center;
      }

      .lmcc-content {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex: 1 0 auto;
      }

      .entity-name-inside {
        margin-left: 16px;
      }
    `;
  }

  static getEntityFromCardType(hass: HomeAssistant, cardType: string): HassEntity | undefined {
    let entity: HassEntity;

    const typeToAttr = {
      [CardSettingsType.AUTO_ON_OFF]: 'sun_auto',
      [CardSettingsType.PREBREW]: 'prebrewing_ton_k1',
      [CardSettingsType.DOSE]: 'dose_k1',
    };

    for (const entity_id in hass.states) {
      entity = hass.states[entity_id];
      if (
        typeToAttr[cardType] in entity.attributes &&
        entity.attributes.attribution == 'La Marzocco'
      )
        return entity;
    }

    return;
  }

  static getStubConfig(): Omit<LaMarzoccoConfigCardConfig, 'type'> {
    return {
      card_type: CardSettingsType.AUTO_ON_OFF,
      name: 'Auto On/Off Hours',
    };
  }

  configChanged(newConfig: LaMarzoccoConfigCardConfig): void {
    const event = new CustomEvent('config-changed', {
      bubbles: true,
      composed: true,
      detail: { config: newConfig },
    });

    this.dispatchEvent(event);
  }
}
