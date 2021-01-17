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
} from './const';
import './editor';
import { DayOfWeek } from './models/day-of-week';
import { Hour } from './models/hour';
import { Minute } from './models/minute';
import { Second } from './models/second';
import { Time } from './models/time';
import { Partial } from './partials';
import { Layout, Period, TimePickerCardConfig } from './types';

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
  @property({ attribute: false }) private day_of_week!: DayOfWeek;
  @property({ attribute: false }) private time_on!: Time;
  @property({ attribute: false }) private time_off!: Time;
  @property() private period_on!: Period;
  @property() private period_off!: Period;

  private get entity(): HassEntity | undefined {
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
      'time-picker-content': true,
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

    if (this.time_on == null) {
      const hour_on = this.entity!.attributes.mon_on;
      const minute_on = 0;
      const second_on = 0;
      const hourOnInstance = new Hour(hour_on, this.config.hour_step, this.config.hour_mode);
      const minuteOnInstance = new Minute(minute_on, this.config.minute_step);
      const secondOnInstance = new Second(second_on, this.config.second_step);
      this.time_on = new Time(
        hourOnInstance,
        minuteOnInstance,
        secondOnInstance,
        this.config.link_values
      );

      const hour_off = this.entity!.attributes.mon_off;
      const minute_off = 0;
      const second_off = 0;
      const hourOffInstance = new Hour(hour_off, this.config.hour_step, this.config.hour_mode);
      const minuteOffInstance = new Minute(minute_off, this.config.minute_step);
      const secondOffInstance = new Second(second_off, this.config.second_step);
      this.time_off = new Time(
        hourOffInstance,
        minuteOffInstance,
        secondOffInstance,
        this.config.link_values
      );

      this.period_on = hourOnInstance.value >= 12 ? Period.PM : Period.AM;
      this.period_off = hourOffInstance.value >= 12 ? Period.PM : Period.AM;

      this.day_of_week = new DayOfWeek(0);
    }

    console.log(
      'day_of_week: %s, hour_on: %d, hour_off: %d',
      this.day_of_week.value,
      this.time_on.hour.value,
      this.time_off.hour.value
    );

    return html`
      <ha-card class=${classMap(this.haCardClass)}>
        ${this.hasNameInHeader ? Partial.headerName(this.day_of_week.value!) : ''}
        <div class=${classMap(this.rowClass)}>
          ${this.hasNameInside ? Partial.nestedName(this.day_of_week.value!, this.entity) : ''}

          <div class=${classMap(this.contentClass)}>
            <time-unit
              .unit=${this.time_on.hour}
              @stepChange=${this.onHourOnStepChange}
              @update=${this.callHassService}
            ></time-unit>
            ${this.config.hide?.minutes === false
              ? html`<div class="time-separator">:</div>
                  <time-unit
                    .unit=${this.time_on.minute}
                    @stepChange=${this.onMinuteOnStepChange}
                    @update=${this.callHassService}
                  ></time-unit>`
              : ''}
            ${this.config.hide?.seconds === false
              ? html`<div class="time-separator">:</div>
                  <time-unit
                    .unit=${this.time_on.second}
                    @stepChange=${this.onSecondOnStepChange}
                    @update=${this.callHassService}
                  ></time-unit>`
              : ''}
            ${this.shouldShowPeriod
              ? html`<time-period
                  .period=${this.period_on}
                  .mode=${this.config.layout?.hour_mode ?? DEFAULT_LAYOUT_HOUR_MODE}
                  @toggle=${this.onPeriodOnToggle}
                ></time-period>`
              : ''}
            <time-unit
              .unit=${this.time_off.hour}
              @stepChange=${this.onHourOffStepChange}
              @update=${this.callHassService}
            ></time-unit>
            ${this.config.hide?.minutes === false
              ? html`<div class="time-separator">:</div>
                  <time-unit
                    .unit=${this.time_off.minute}
                    @stepChange=${this.onMinuteOffStepChange}
                    @update=${this.callHassService}
                  ></time-unit>`
              : ''}
            ${this.config.hide?.seconds === false
              ? html`<div class="time-separator">:</div>
                  <time-unit
                    .unit=${this.time_off.second}
                    @stepChange=${this.onSecondOffStepChange}
                    @update=${this.callHassService}
                  ></time-unit>`
              : ''}
            ${this.shouldShowPeriod
              ? html`<time-period
                  .period=${this.period_off}
                  .mode=${this.config.layout?.hour_mode ?? DEFAULT_LAYOUT_HOUR_MODE}
                  @toggle=${this.onPeriodOffToggle}
                ></time-period>`
              : ''}
          </div>
        </div>
      </ha-card>
    `;
  }

  setConfig(config): void {
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

  private onPeriodOnToggle(): void {
    this.time_on.hour.togglePeriod();
    this.callHassService();
  }

  private onPeriodOffToggle(): void {
    this.time_off.hour.togglePeriod();
    this.callHassService();
  }

  private onHourOnStepChange(event: CustomEvent): void {
    this.time_on.hourStep(event.detail.direction);
    this.callHassService();
  }

  private onMinuteOnStepChange(event: CustomEvent): void {
    this.time_on.minuteStep(event.detail.direction);
    this.callHassService();
  }

  private onSecondOnStepChange(event: CustomEvent): void {
    this.time_on.secondStep(event.detail.direction);
    this.callHassService();
  }

  private onHourOffStepChange(event: CustomEvent): void {
    this.time_off.hourStep(event.detail.direction);
    this.callHassService();
  }

  private onMinuteOffStepChange(event: CustomEvent): void {
    this.time_off.minuteStep(event.detail.direction);
    this.callHassService();
  }

  private onSecondOffStepChange(event: CustomEvent): void {
    this.time_off.secondStep(event.detail.direction);
    this.callHassService();
  }

  private callHassService(): Promise<void> {
    if (!this.hass) {
      throw new Error('Unable to update datetime');
    }

    console.log(
      'Calling service with %s, %s, %s',
      this.day_of_week.value.toLowerCase(),
      this.time_on.hour.value,
      this.time_off.hour.value
    );

    return Promise.resolve(undefined);

    // return this.hass.callService(SERVICE_DOMAIN, 'set_auto_on_off_hours', {
    //   day_of_week: this.day_of_week.value.toLowerCase(),
    //   hour_on: this.time_on.hour.value,
    //   hour_off: this.time_off.hour.value,
    // });
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
        padding: 16px;
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
        padding: 16px;
      }

      .time-picker-row.embedded {
        padding: 0;
      }

      .time-picker-row.with-header-name {
        padding: 8px 16px 16px;
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
