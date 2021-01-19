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
import './components/time-period.component';
import './components/time-unit.component';
import {
  CARD_SIZE,
  CARD_VERSION,
  DEFAULT_LAYOUT_ALIGN_CONTROLS,
  DEFAULT_LAYOUT_HOUR_MODE,
  ENTITY_DOMAIN,
  SERVICE_DOMAIN,
  DAYS,
} from './const';
import './editor';
import { Day } from './day';
import { Partial } from './partials';
import { Layout, TimePickerCardConfig } from './types';

console.info(
  `%c  TIME-PICKER-CARD  \n%c  Version ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'time-picker-card',
  name: 'Time Picker Card',
  description: 'A Time Picker card for setting the time value of Input Datetime entities.',
});
@customElement('time-picker-card')
export class TimePickerCard extends LitElement implements LovelaceCard {
  @property({ type: Object }) hass!: HomeAssistant;
  @property({ attribute: false }) private config!: TimePickerCardConfig;
  private days!: Map<string, Day>;

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
      'time-picker-row': true,
      'with-header-name': this.hasNameInHeader,
      embedded: this.isEmbedded,
    };
  }

  private get contentClass(): ClassInfo {
    return {
      'time-picker-control': true,
      [`layout-${this.layoutAlign}`]: true,
    };
  }

  private get controlClass(): ClassInfo {
    return {
      'time-picker-control': true,
      [`layout-${this.layoutAlign}`]: true,
    };
  }

  private get buttonLabelClass(): ClassInfo {
    return {
      'time-picker-button-label': true,
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

    if (typeof this.days === 'undefined') {
      let day_of_week: string;
      this.days = new Map();

      for (day_of_week of DAYS) {
        const day = new Day(
          day_of_week,
          this.entity!.attributes[day_of_week.toLowerCase() + '_on'],
          this.entity!.attributes[day_of_week.toLowerCase() + '_off'],
          this.config,
          this.entity!.attributes[day_of_week.toLowerCase()] === 'Enabled'
        );
        this.days.set(day_of_week, day);
      }
    }

    for (const day of this.days.values()) this.setButtonColors(day);

    return html` ${this.hasNameInHeader ? Partial.headerName(this.name!) : ''}
      <ha-card class=${classMap(this.rowClass)}>
        ${this.hasNameInside ? Partial.nestedName(this.name!, this.entity) : ''}
        ${repeat(
          this.days.values(),
          (day) => html`
        <div class=${classMap(this.controlClass)}>
        <button class=${classMap(this.buttonLabelClass)} @click="${(e: CustomEvent) =>
            this.onEnableDisable(e, day)}}" id=${day.day_of_week}>${day.day_of_week}</button>
        <time-unit
            .unit=${day.time_on.hour}
            @stepChange=${this.onHourOnStepChange}
            @update=${this.callSetOnOffHours}
        ></time-unit>
        ${
          this.config.hide?.minutes === false
            ? html`<div class="time-separator">:</div>
                <time-unit
                  .unit=${day.time_on.minute}
                  @stepChange=${this.onMinuteOnStepChange}
                  @update=${this.callSetOnOffHours}
                ></time-unit>`
            : ''
        }
        ${
          this.config.hide?.seconds === false
            ? html`<div class="time-separator">:</div>
                <time-unit
                  .unit=${day.time_on.second}
                  @stepChange=${this.onSecondOnStepChange}
                  @update=${this.callSetOnOffHours}
                ></time-unit>`
            : ''
        }
        ${
          this.shouldShowPeriod
            ? html`<time-period
                .period=${day.period_on}
                .mode=${this.config.layout?.hour_mode ?? DEFAULT_LAYOUT_HOUR_MODE}
                @toggle=${this.onPeriodOnToggle}
              ></time-period>`
            : ''
        }
        <time-unit
            .unit=${day.time_off.hour}
            @stepChange=${this.onHourOffStepChange}
            @update=${this.callSetOnOffHours}
        ></time-unit>
        ${
          this.config.hide?.minutes === false
            ? html`<div class="time-separator">:</div>
                <time-unit
                  .unit=${day.time_off.minute}
                  @stepChange=${this.onMinuteOffStepChange}
                  @update=${this.callSetOnOffHours}
                ></time-unit>`
            : ''
        }
        ${
          this.config.hide?.seconds === false
            ? html`<div class="time-separator">:</div>
                <time-unit
                  .unit=${day.time_off.second}
                  @stepChange=${this.onSecondOffStepChange}
                  @update=${this.callSetOnOffHours}
                ></time-unit>`
            : ''
        }
        ${
          this.shouldShowPeriod
            ? html`<time-period
                .period=${day.period_off}
                .mode=${this.config.layout?.hour_mode ?? DEFAULT_LAYOUT_HOUR_MODE}
                @toggle=${this.onPeriodOffToggle}
              ></time-period>`
            : ''
        }
        </div>
    </div></div>`
        )}
      </ha-card>`;
  }

  setConfig(config: TimePickerCardConfig): void {
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

  private setButtonColors(day: Day): void {
    const root = this.shadowRoot;
    const button = root!.getElementById(day.day_of_week);
    if (button) {
      const color = day.enabled ? 'var(--success-color)' : 'var(--tpc-off-color)';
      button.style.color = color;
      button.style.border = '2px solid ' + color;
    }
  }

  private adjustMinMax(day: Day): void {
    if (day) {
      day.time_on.hour.maxValue = day.time_off.hour.value - 1;
      day.time_off.hour.minValue = day.time_on.hour.value + 1;
    }
  }

  private onPeriodOnToggle(): void {
    // this.time_on.hour.togglePeriod();
    // this.callHassService(event);
  }

  private onPeriodOffToggle(): void {
    // this.time_off.hour.togglePeriod();
    // this.callHassService(event);
  }

  private onEnableDisable(event: CustomEvent, day: Day): void {
    event = event;
    day.enabled = !day.enabled;

    this.setButtonColors(day);
    this.callEnableDisable(day);
  }

  private onHourOnStepChange(event: CustomEvent): void {
    const day = this.days.get(event.detail.dayOfWeek);
    if (day) {
      day.time_on.hourStep(event.detail.direction);
      this.adjustMinMax(day);
      this.callSetOnOffHours(event);
    }
  }

  private onMinuteOnStepChange(event: CustomEvent): void {
    const day = this.days.get(event.detail.dayOfWeek);
    if (day) {
      day!.time_on.minuteStep(event.detail.direction);
      this.adjustMinMax(day);
      this.callSetOnOffHours(event);
    }
  }

  private onSecondOnStepChange(event: CustomEvent): void {
    const day = this.days.get(event.detail.dayOfWeek);
    if (day) {
      day.time_on.secondStep(event.detail.direction);
      this.adjustMinMax(day);
      this.callSetOnOffHours(event);
    }
  }

  private onHourOffStepChange(event: CustomEvent): void {
    const day = this.days.get(event.detail.dayOfWeek);
    if (day) {
      day.time_off.hourStep(event.detail.direction);
      this.adjustMinMax(day);
      this.callSetOnOffHours(event);
    }
  }

  private onMinuteOffStepChange(event: CustomEvent): void {
    const day = this.days.get(event.detail.dayOfWeek);
    if (day) {
      day.time_off.minuteStep(event.detail.direction);
      this.adjustMinMax(day);
      this.callSetOnOffHours(event);
    }
  }

  private onSecondOffStepChange(event: CustomEvent): void {
    const day = this.days.get(event.detail.dayOfWeek);
    if (day) {
      day!.time_off.secondStep(event.detail.direction);
      this.adjustMinMax(day);
      this.callSetOnOffHours(event);
    }
  }

  private callSetOnOffHours(event: CustomEvent): Promise<void> {
    if (!this.hass) {
      throw new Error('Unable to update settings');
    }
    const day = this.days.get(event.detail.dayOfWeek);

    if (!day) return Promise.resolve(undefined);

    console.log(
      'Calling set_on_off_hours service with %s, %s, %s',
      day.day_of_week.toLowerCase(),
      day.time_on.hour.value,
      day.time_off.hour.value
    );

    // return this.hass.callService(SERVICE_DOMAIN, 'set_auto_on_off_hours', {
    //   day_of_week: day.day_of_week.toLowerCase(),
    //   hour_on: day.time_on.hour.value,
    //   hour_off: day.time_off.hour.value,
    // });

    return Promise.resolve(undefined);
  }

  private callEnableDisable(day: Day): Promise<void> {
    if (!this.hass) {
      throw new Error('Unable to update settings');
    }

    if (!day) return Promise.resolve(undefined);

    console.log(
      'Calling set_enable_auto_on_off service with %s, %s',
      day.day_of_week.toLowerCase(),
      day.enabled
    );

    // return this.hass.callService(SERVICE_DOMAIN, 'set_auto_on_off_enable', {
    //   day_of_week: day.day_of_week.toLowerCase(),
    //   enable: day.enabled,
    // });

    return Promise.resolve(undefined);
  }

  static get styles(): CSSResult {
    return css`
      :host {
        --tpc-elements-background-color: var(
          --time-picker-elements-background-color,
          var(--primary-color)
        );

        --tpc-icon-color: var(--time-picker-icon-color, var(--primary-text-color));
        --tpc-text-color: var(--time-picker-text-color, #fff);
        --tpc-accent-color: var(--time-picker-accent-color, var(--primary-color));
        --tpc-off-color: var(--time-picker-off-color, var(--disabled-text-color));

        --tpc-border-radius: var(--time-picker-border-radius, var(--ha-card-border-radius, 4px));
      }

      ha-card.embedded {
        box-shadow: none;
      }

      .time-picker-header {
        padding: 0px;
        color: var(--tpc-text-color);
        background-color: var(--tpc-elements-background-color);
        border-top-left-radius: var(--tpc-border-radius);
        border-top-right-radius: var(--tpc-border-radius);
        font-size: 1em;
        text-align: center;
      }

      .time-picker-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 2px;
      }

      .time-picker-control {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px;
      }

      .time-picker-button-label {
        background-color: var(--primary-background-color);
        color: var(--tpc-text-color);
        border: 2px solid var(--success-color);
        font-weight: bolder;
      }

      .time-picker-row.embedded {
        padding: 2;
        justify-content: center;
      }

      .time-picker-row.with-header-name {
        padding: 6px 6px 6px;
        justify-content: center;
      }

      .time-picker-content {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex: 1 0 auto;
      }

      .time-picker-content.layout-left {
        justify-content: flex-start;
      }

      .time-picker-content.layout-center {
        justify-content: center;
      }

      .time-picker-content.layout-right {
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
  ): Omit<TimePickerCardConfig, 'type'> {
    const datetimeEntity = entities.find((entityId) => computeDomain(entityId) === ENTITY_DOMAIN);

    return {
      entity: datetimeEntity || 'switch.buzz_auto_on_off',
      hour_mode: 24,
      hour_step: 1,
      minute_step: 5,
    };
  }

  static getConfigElement(): LovelaceCard {
    return document.createElement('time-picker-card-editor') as LovelaceCard;
  }
}
