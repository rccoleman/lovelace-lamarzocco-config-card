import { HomeAssistant } from 'custom-card-helpers';
import { CSSResult, customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { CARD_VERSION } from './const';
import { styles } from './styles';
import { TemplateCardConfig } from './types';

console.info(
  `%c  TEMPLATE-CARD \n%c  Version ${CARD_VERSION}    `,
  'color: darkgreen; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

@customElement('template-card')
export class TemplateCard extends LitElement {
  @property() private hass?: HomeAssistant;
  @property() private config?: TemplateCardConfig;

  render(): TemplateResult | null {
    if (!this.config || !this.hass) {
      return null;
    }

    return html`<ha-card>TemplateCard</ha-card>`;
  }

  setConfig(config): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    if (!config.entity) {
      throw new Error('You need to set an entity');
    }

    this.config = config;
  }

  getCardSize(): number {
    return 3;
  }

  static get styles(): CSSResult {
    return styles;
  }
}
