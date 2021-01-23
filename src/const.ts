import * as pkg from '../package.json';
import { CardType } from './types';

export const ENTITY_DOMAIN = 'switch';
export const SERVICE_DOMAIN = 'lamarzocco';

export const CARD_VERSION = pkg.version;
export const CARD_SIZE = 3;

// Config defaults
export const DEFAULT_CARD_TYPE = CardType.AUTO_ON_OFF;
