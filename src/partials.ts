import { html, TemplateResult } from 'lit-element';
import { LaMarzoccoConfigCardConfig } from './types';
import { LovelaceCard } from 'custom-card-helpers';

export class Partial {
  static error(error: string, origConfig: LaMarzoccoConfigCardConfig): TemplateResult {
    const errorCard = document.createElement('hui-error-card') as LovelaceCard;
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig,
    });

    return html`${errorCard}`;
  }

  static headerName(title: string): TemplateResult {
    return html`<div class="lmcc-header">${title}</div>`;
  }
}
