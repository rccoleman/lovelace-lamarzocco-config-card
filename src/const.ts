import * as pkg from '../package.json';
import { CardSettingsType } from './types';

export const SWITCH_DOMAIN = 'switch';
export const SERVICE_DOMAIN = 'lamarzocco';

export const CARD_VERSION = pkg.version;
export const CARD_SIZE = 6;

// Config defaults
export const DEFAULT_CARD_TYPE = CardSettingsType.AUTO_ON_OFF;

export const MODEL_NAME = 'model_name';
