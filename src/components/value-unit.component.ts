import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from 'lit-element';
import { ValueUnit } from '../models/value-unit';
import { Direction } from '../types';

/**
 * Renders a single value selector
 */
@customElement('value-unit')
export class ValueUnitComponent extends LitElement {
  static readonly EVENT_UPDATE = 'update';
  static readonly EVENT_STEP_CHANGE = 'stepChange';

  @property({ attribute: false }) private unit!: ValueUnit;

  render(): TemplateResult {
    return html`
      <div class="value-unit">
        ${this.renderStepChanger(Direction.UP)}
        <input
          class="value-input"
          type="number"
          placeholder="MM"
          min=${this.unit.minValue}
          max=${this.unit.maxValue}
          .value="${this.unit.toString()}"
          @change=${this.onInputChange}
        />
        ${this.renderStepChanger(Direction.DOWN)}
      </div>
    `;
  }

  onInputChange({ target: { value } }: { target: HTMLInputElement }): void {
    const label = this.unit.label;
    this.unit.setStringValue(value);
    const event = new CustomEvent(ValueUnitComponent.EVENT_UPDATE, { detail: { label } });
    this.dispatchEvent(event);
  }

  onStepChangerClick(direction: Direction): void {
    const label = this.unit.label;
    const event = new CustomEvent(ValueUnitComponent.EVENT_STEP_CHANGE, {
      detail: { direction, label },
    });
    this.dispatchEvent(event);
    this.requestUpdate();
  }

  private renderStepChanger(direction: Direction): TemplateResult {
    return html`
      <div class="value-range-icon" @click=${() => this.onStepChangerClick(direction)}>
        <ha-icon .icon="hass:chevron-${direction}"></ha-icon>
        <mwc-ripple id="ripple"></mwc-ripple>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .value-unit {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 2px;
      }

      .value-range-icon {
        width: 30px;
        padding: 2px;
        text-align: center;
        cursor: pointer;
        color: var(--tpc-icon-color);
      }

      .value-input {
        width: 30px;
        padding: 4px 4px 4px;
        background: var(--primary-background-color);
        border: 2px solid var(--tpc-elements-background-color);
        color: var(--tpc-text-color, #fff);
        text-align: center;
        font-size: 1em;
        -moz-appearance: textfield;

        transition: border-color 0.2s ease-in-out;
      }

      .value-input:focus {
        outline: none;
      }

      .value-input:invalid {
        box-shadow: none;
        outline: none;
        border: 0;
        border-bottom: 2px solid red;
      }

      .value-input::-webkit-inner-spin-button,
      .value-input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    `;
  }
}
